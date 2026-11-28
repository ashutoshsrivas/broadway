import { db } from "@/lib/db";
import { shippingFor, type ShippingMethod } from "@/lib/shipping";
import { toRupees } from "@/lib/utils";
import { syncSoldOut } from "@/lib/stock-status";

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

/** A priced line plus everything the bag needs to render and explain itself. */
export type CartLine = PricedLine & {
  slug: string;
  name: string;
  brand: string | null;
  mrp: number;
  stock: number;
  available: boolean;
  /** Why this line cannot be bought right now, in words for the shopper. */
  issue: string | null;
};

export type Repriced = {
  lines: CartLine[];
  subtotal: number;
  shipping: number;
  total: number;
  hasIssues: boolean;
};

/**
 * Price a bag from the database.
 *
 * This is the only place a price is derived, and it is derived from the
 * product row every time. The browser sends ids and quantities; anything it
 * believes about price is ignored. That matters twice over — it stops a
 * tampered cart setting its own price, and it stops a cart that has sat in
 * someone's browser for a week from showing last month's price next to this
 * month's charge.
 *
 * Problems are reported per line rather than thrown, so the bag can say which
 * item is the trouble instead of failing whole.
 */
export async function repriceCart(
  input: { variantId: string; quantity: number }[],
  method: ShippingMethod = "STANDARD"
): Promise<Repriced> {
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

  const lines: CartLine[] = input.map((requested) => {
    const variant = variants.find((v) => v.id === requested.variantId);

    if (!variant) {
      return {
        productId: "",
        variantId: requested.variantId,
        productName: "This item",
        variantLabel: "",
        sku: "",
        imageUrl: null,
        quantity: requested.quantity,
        unitPrice: 0,
        totalPrice: 0,
        slug: "",
        name: "This item",
        brand: null,
        mrp: 0,
        stock: 0,
        available: false,
        issue: "No longer available.",
      };
    }

    const product = variant.product;
    const brand = product.brand?.name ?? null;
    const unitPrice = toRupees(variant.priceOverride ?? product.price);

    let issue: string | null = null;
    if (product.status !== "ACTIVE") issue = "No longer available.";
    else if (variant.stock === 0) issue = "Sold out.";
    else if (variant.stock < requested.quantity) {
      issue = `Only ${variant.stock} left.`;
    }

    return {
      productId: variant.productId,
      variantId: variant.id,
      productName: brand ? `${brand} ${product.name}` : product.name,
      variantLabel: variant.colorName,
      sku: variant.sku,
      imageUrl: product.images[0]?.url ?? null,
      quantity: requested.quantity,
      unitPrice,
      totalPrice: unitPrice * requested.quantity,
      slug: product.slug,
      name: product.name,
      brand,
      mrp: toRupees(product.mrp),
      stock: variant.stock,
      available: issue === null,
      issue,
    };
  });

  // Only buyable lines count toward the total, so an unavailable item cannot
  // inflate what the shopper is quoted.
  const subtotal = lines
    .filter((l) => l.available)
    .reduce((sum, l) => sum + l.totalPrice, 0);
  const shipping = shippingFor(subtotal, method);

  return {
    lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    hasIssues: lines.some((l) => !l.available),
  };
}

/**
 * The same pricing, for order creation, where a problem must stop the order
 * rather than be displayed.
 */
export async function priceCart(
  input: { variantId: string; quantity: number }[],
  method: ShippingMethod = "STANDARD"
): Promise<{ lines: PricedLine[]; subtotal: number; shipping: number; total: number }> {
  const priced = await repriceCart(input, method);

  const bad = priced.lines.find((l) => !l.available);
  if (bad) throw new Error(`${bad.productName}: ${bad.issue}`);

  return {
    lines: priced.lines.map(({ slug, name, brand, mrp, stock, available, issue, ...line }) => {
      void slug; void name; void brand; void mrp; void stock; void available; void issue;
      return line;
    }),
    subtotal: priced.subtotal,
    shipping: priced.shipping,
    total: priced.total,
  };
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
      select: { variantId: true, quantity: true, productId: true },
    });

    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await syncSoldOut(tx, items.map((i) => i.productId));
  });
}
