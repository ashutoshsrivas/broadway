import { db } from "@/lib/db";
import { shippingFor } from "@/lib/shipping";

/**
 * Next human-facing order reference, "BO-2026-0001".
 *
 * Counting rows is racy under concurrent checkouts, so `orderNumber` is
 * `@unique` and the caller retries on collision — the database, not this
 * function, is what guarantees uniqueness.
 */
export async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BO-${year}-`;

  const latest = await db.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  const lastSeq = latest ? parseInt(latest.orderNumber.slice(prefix.length), 10) : 0;
  const next = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export type PricedLine = {
  productId: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

/**
 * Turn `[{ variantId, quantity }]` from the browser into priced lines.
 *
 * Every price comes from the database. A `price` in the request body is
 * ignored outright: trusting it would let a buyer order a ₹40,000 frame for
 * ₹1, and since the payment check only compares the paid amount against the
 * stored order total, that ₹1 payment would then verify cleanly.
 *
 * Stock is checked here too, so an out-of-stock line fails before an order row
 * or a payment ever exists.
 */
export async function priceCart(
  input: { variantId: string; quantity: number }[]
): Promise<{ lines: PricedLine[]; subtotal: number; shipping: number; total: number }> {
  const variants = await db.productVariant.findMany({
    where: { id: { in: input.map((i) => i.variantId) } },
    include: {
      product: {
        include: {
          brand: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
  });

  const lines: PricedLine[] = input.map((requested) => {
    const variant = variants.find((v) => v.id === requested.variantId);
    if (!variant) throw new Error("One of the items is no longer available.");
    if (variant.product.status !== "ACTIVE") {
      throw new Error(`"${variant.product.name}" is no longer available.`);
    }
    if (variant.stock < requested.quantity) {
      throw new Error(
        `Only ${variant.stock} left of "${variant.product.name}" in ${variant.colorName}.`
      );
    }

    const unitPrice = variant.priceOverride ?? variant.product.price;
    const brand = variant.product.brand?.name;

    return {
      productId: variant.productId,
      variantId: variant.id,
      productName: brand ? `${brand} ${variant.product.name}` : variant.product.name,
      variantLabel: variant.colorName,
      sku: variant.sku,
      imageUrl: variant.product.images[0]?.url ?? null,
      quantity: requested.quantity,
      unitPrice,
      totalPrice: unitPrice * requested.quantity,
    };
  });

  const subtotal = lines.reduce((sum, l) => sum + l.totalPrice, 0);
  const shipping = shippingFor(subtotal);
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

/**
 * Decrement stock for an order exactly once.
 *
 * The `stockDeducted` flag is flipped inside the same transaction that writes
 * the decrements, and the update is conditional on it still being false — so a
 * payment callback delivered twice (Razorpay retries) cannot double-deduct.
 */
export async function deductStock(orderId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, stockDeducted: false },
      data: { stockDeducted: true },
    });
    if (claimed.count === 0) return; // already deducted by an earlier call

    const items = await tx.orderItem.findMany({
      where: { orderId },
      select: { variantId: true, quantity: true },
    });

    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });
}
