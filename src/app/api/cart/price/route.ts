import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { repriceCart } from "@/lib/order";
import { asShippingMethod } from "@/lib/shipping";

const schema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive().max(20),
      })
    )
    .max(50),
  /** Which delivery the shopper has picked, so the quoted total matches. */
  shippingMethod: z.string().optional(),
});

/**
 * Current prices for the items in someone's bag.
 *
 * The bag lives in the browser and can be days old, so it carries ids and
 * quantities only — every price shown comes from here. Same derivation the
 * order uses, so the total quoted is the total charged.
 */
export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.items.length === 0) {
    return NextResponse.json({ lines: [], subtotal: 0, shipping: 0, total: 0, hasIssues: false });
  }

  try {
    return NextResponse.json(
      await repriceCart(parsed.data.items, asShippingMethod(parsed.data.shippingMethod))
    );
  } catch (err) {
    console.error("Reprice failed", err);
    return NextResponse.json({ error: "Could not price your bag." }, { status: 500 });
  }
}
