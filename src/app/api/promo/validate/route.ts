import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkPromo } from "@/lib/promo";
import { priceCart } from "@/lib/order";
import { rateLimit, callerIp } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().trim().min(1).max(40),
  email: z.string().trim().email("Enter your email first"),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().positive().max(20) }))
    .min(1),
});

/**
 * Check a code before the order is placed, so checkout can show the saving.
 *
 * The answer here is advisory only — /api/orders re-runs exactly the same
 * check when the order is created, so a tampered response buys nothing.
 */
export async function POST(req: NextRequest) {
  // Guessing codes is the obvious abuse, so this is limited harder than the
  // other public endpoints.
  const { limited } = rateLimit({ key: `promo:${callerIp(req)}`, max: 15, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ ok: false, reason: "Too many attempts. Wait a minute." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, reason: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const { subtotal } = await priceCart(parsed.data.items);
    const result = await checkPromo(parsed.data.code, parsed.data.email, subtotal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, reason: "Could not check that code." }, { status: 400 });
  }
}
