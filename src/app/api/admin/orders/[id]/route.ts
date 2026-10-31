import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { syncSoldOut } from "@/lib/stock-status";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || (!parsed.data.status && !parsed.data.paymentStatus)) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const order = await db.order.findUnique({ where: { id }, select: { id: true, stockDeducted: true } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await db.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: parsed.data });

    // Cancelling an order that already took stock puts it back on the shelf,
    // and clears the flag so the return can't be applied twice.
    if (parsed.data.status === "CANCELLED" && order.stockDeducted) {
      const items = await tx.orderItem.findMany({
        where: { orderId: id },
        select: { variantId: true, quantity: true, productId: true },
      });
      for (const item of items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await syncSoldOut(tx, items.map((i) => i.productId));
      await tx.order.update({ where: { id }, data: { stockDeducted: false } });
    }
  });

  return NextResponse.json({ ok: true });
}
