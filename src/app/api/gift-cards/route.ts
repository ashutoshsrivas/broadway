import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit, callerIp } from "@/lib/rate-limit";
import { nextOrderNumber } from "@/lib/order";
import { generateCode, GIFT_CARD_MAX, GIFT_CARD_MIN, checkGiftCard } from "@/lib/gift-card";
import { toRupees } from "@/lib/utils";

const schema = z.object({
  value: z.number().min(GIFT_CARD_MIN).max(GIFT_CARD_MAX),
  senderName: z.string().trim().min(1, "Who is it from?").max(120),
  recipientName: z.string().trim().max(120).optional(),
  recipientEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().trim().max(500).optional(),
  buyerEmail: z.string().trim().email("Enter a valid email"),
  buyerPhone: z.string().trim().min(6).max(20),
});

/**
 * Buy a gift card.
 *
 * The value is read from the request but clamped and re-rounded here, and
 * the card's balance is set from that same figure — never from anything the
 * browser says the card is worth. A card is worth what was paid for it, and
 * this is the only place that decides either number.
 *
 * The card is issued PENDING and the order is COD-style "pay in store or on
 * delivery", because a card that could be spent before it was paid for is
 * exactly the hole the shop asked us to close. The admin activates it once
 * the money is in.
 */
export async function POST(req: NextRequest) {
  const { limited } = rateLimit({ key: `giftcard:${callerIp(req)}`, max: 5, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Check the form" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const value = toRupees(data.value);
  const session = await auth();

  try {
    const code = await generateCode();

    const card = await db.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber: await nextOrderNumber(),
          userId: session?.user?.id ?? null,
          email: data.buyerEmail,
          phone: data.buyerPhone,
          name: data.senderName,
          line1: "—",
          city: "—",
          state: "—",
          pincode: "—",
          subtotal: value,
          shipping: 0,
          total: value,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          status: "PENDING",
          notes: `Gift card ${code}${data.recipientName ? ` for ${data.recipientName}` : ""}`,
        },
        select: { id: true, orderNumber: true },
      });

      return tx.giftCard.create({
        data: {
          code,
          value,
          balance: value,
          status: "PENDING",
          senderName: data.senderName,
          recipientName: data.recipientName || null,
          recipientEmail: data.recipientEmail || null,
          message: data.message || null,
          purchaseOrderId: order.id,
        },
        select: { code: true, value: true },
      });
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (err) {
    console.error("Gift card purchase failed", err);
    return NextResponse.json({ error: "Could not create that gift card." }, { status: 500 });
  }
}

/** Check a code and what it would take off a given subtotal. */
export async function PUT(req: NextRequest) {
  const { limited } = rateLimit({ key: `giftcheck:${callerIp(req)}`, max: 20, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const result = await checkGiftCard(body?.code, Number(body?.subtotal) || 0);
  if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 400 });

  return NextResponse.json(result);
}
