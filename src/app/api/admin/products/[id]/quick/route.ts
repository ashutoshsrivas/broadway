import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { syncSoldOut } from "@/lib/stock-status";

const schema = z
  .object({
    price: z.number().min(0).max(10_000_000).optional(),
    stock: z.number().int().min(0).max(100_000).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).optional(),
  })
  .refine((v) => v.price !== undefined || v.stock !== undefined || v.status !== undefined, {
    message: "Nothing to change",
  });

/**
 * The two fields the shop changes most often, editable from the list.
 *
 * Separate from the full product PATCH, which expects a whole product and
 * rewrites its colourways — sending that from a table cell would mean the
 * list had to hold every field of every row just to change one number.
 *
 * Stock only applies to a product with a single colourway. With more than
 * one there is no honest answer to "set stock to 4" from a table, and
 * guessing — writing it to the first, or splitting it — would quietly
 * destroy counts the shop keeps per colour.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const product = await db.product.findUnique({
    where: { id },
    select: { id: true, mrp: true, variants: { select: { id: true } } },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { price, stock, status } = parsed.data;

  if (price !== undefined && price > product.mrp) {
    return NextResponse.json(
      { error: "The selling price cannot be above the MRP." },
      { status: 400 }
    );
  }

  if (stock !== undefined && product.variants.length !== 1) {
    return NextResponse.json(
      { error: "This product has several colourways — set stock on the product page." },
      { status: 400 }
    );
  }

  await db.$transaction(async (tx) => {
    if (price !== undefined || status !== undefined) {
      await tx.product.update({
        where: { id },
        data: { ...(price !== undefined ? { price } : {}), ...(status ? { status } : {}) },
      });
    }
    if (stock !== undefined) {
      await tx.productVariant.update({ where: { id: product.variants[0].id }, data: { stock } });
      // Starts or clears the sold-out clock, so the ten-day rule follows an
      // edit made here exactly as it follows an order.
      await syncSoldOut(tx, [id]);
    }
  });

  const fresh = await db.product.findUnique({
    where: { id },
    select: {
      price: true,
      mrp: true,
      status: true,
      soldOutAt: true,
      variants: { select: { stock: true } },
    },
  });

  return NextResponse.json({
    price: fresh?.price,
    stock: fresh?.variants.reduce((sum, v) => sum + v.stock, 0) ?? 0,
    status: fresh?.status,
    soldOut: Boolean(fresh?.soldOutAt),
  });
}
