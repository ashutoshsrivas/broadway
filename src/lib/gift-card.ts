import { randomInt } from "crypto";
import { db } from "@/lib/db";
import { toRupees } from "@/lib/utils";

/** What a card may be bought for. */
export const GIFT_CARD_MIN = 500;
export const GIFT_CARD_MAX = 100_000;

/** The amounts offered as one-tap choices, before the custom field. */
export const GIFT_CARD_PRESETS = [2000, 5000, 10000, 25000];

/**
 * Unambiguous when read aloud or copied off a card: no O/0, no I/1/L.
 * A gift card gets dictated over the phone more often than it gets pasted.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(): string {
  const block = () =>
    Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `BO-${block()}-${block()}`;
}

/**
 * A code nothing else holds.
 *
 * `code` is unique in the database, so the loop is belt and braces against
 * an unlucky collision rather than the thing that guarantees uniqueness —
 * the insert would fail either way.
 */
export async function generateCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = randomCode();
    const taken = await db.giftCard.findUnique({ where: { code }, select: { id: true } });
    if (!taken) return code;
  }
  throw new Error("Could not allocate a gift card code");
}

export type GiftCardCheck =
  | { ok: true; code: string; balance: number; applies: number }
  | { ok: false; reason: string };

/**
 * What a card is worth against a given subtotal.
 *
 * Never more than the balance, and never more than the order — a card
 * cannot turn into change, and a ₹10,000 card against a ₹3,000 order spends
 * ₹3,000 and keeps the rest for next time.
 */
export async function checkGiftCard(
  rawCode: string | undefined,
  subtotal: number
): Promise<GiftCardCheck> {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return { ok: false, reason: "Enter a gift card code." };

  const card = await db.giftCard.findUnique({
    where: { code },
    select: { code: true, balance: true, status: true, expiresAt: true },
  });

  if (!card) return { ok: false, reason: "We don't recognise that code." };
  if (card.status === "VOID") return { ok: false, reason: "That card has been cancelled." };
  if (card.status === "PENDING") {
    return { ok: false, reason: "That card hasn't been paid for yet." };
  }
  if (card.balance <= 0) return { ok: false, reason: "That card has nothing left on it." };
  if (card.expiresAt && card.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "That card has expired." };
  }

  const applies = toRupees(Math.min(card.balance, Math.max(0, subtotal)));
  if (applies <= 0) return { ok: false, reason: "Add something to your bag first." };

  return { ok: true, code: card.code, balance: card.balance, applies };
}

/**
 * Take the money off the card, once the order is actually paid for.
 *
 * Called from the same two places stock is deducted — cash on delivery, and
 * a verified online payment — so a card is never spent on an order that was
 * abandoned at the payment sheet.
 *
 * Idempotent: the redemption row is the record of the debit, so a replayed
 * webhook or a double-click finds the row already there and does nothing.
 * A ledger rather than a flag means the balance can always be re-derived
 * from what was really spent.
 */
export async function commitGiftCard(orderId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { giftCardCode: true, giftCardAmount: true },
    });
    if (!order?.giftCardCode || order.giftCardAmount <= 0) return;

    const already = await tx.giftCardRedemption.findFirst({
      where: { orderId },
      select: { id: true },
    });
    if (already) return;

    const card = await tx.giftCard.findUnique({
      where: { code: order.giftCardCode },
      select: { id: true, balance: true },
    });
    if (!card) return;

    // Never below zero, even if the balance moved between checkout and
    // payment — two orders racing the same card each take what is left.
    const amount = Math.min(card.balance, order.giftCardAmount);
    if (amount <= 0) return;

    const balance = card.balance - amount;

    await tx.giftCard.update({
      where: { id: card.id },
      data: { balance, status: balance <= 0 ? "SPENT" : "ACTIVE" },
    });

    await tx.giftCardRedemption.create({
      data: { giftCardId: card.id, orderId, amount },
    });
  });
}
