import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "SPENT", "VOID"]).optional(),
  /** Admin top-up or correction, in rupees. Never below what has been spent. */
  balance: z.number().min(0).max(1_000_000).optional(),
});

/**
 * Activate, void or correct a card.
 *
 * Activating is the moment money has been received, so it is deliberately a
 * human action rather than something the purchase flow does for itself —
 * that is what stops a card being spent before it is paid for.
 *
 * A balance may be corrected but never raised above the card's face value:
 * the whole guarantee is that a card is worth what was paid for it, and an
 * admin typo must not be able to break that.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const card = await db.giftCard.findUnique({
    where: { id },
    select: { id: true, value: true, balance: true },
  });
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: { status?: string; balance?: number } = {};

  if (parsed.data.balance !== undefined) {
    if (parsed.data.balance > card.value) {
      return NextResponse.json(
        { error: `A card cannot be worth more than the ${card.value} paid for it.` },
        { status: 400 }
      );
    }
    data.balance = parsed.data.balance;
  }

  if (parsed.data.status) {
    data.status = parsed.data.status;
    // Activating a card that has been spent down to nothing would put it in
    // a state the storefront refuses anyway; say so rather than allow it.
    if (parsed.data.status === "ACTIVE" && (data.balance ?? card.balance) <= 0) {
      return NextResponse.json(
        { error: "That card has nothing left on it." },
        { status: 400 }
      );
    }
  }

  const updated = await db.giftCard.update({
    where: { id },
    data,
    select: { id: true, status: true, balance: true },
  });

  return NextResponse.json({ card: updated });
}
