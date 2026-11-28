import { db } from "@/lib/db";
import { GiftCardManager } from "@/components/admin/GiftCardManager";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminGiftCardsPage() {
  const cards = await db.giftCard.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      value: true,
      balance: true,
      status: true,
      senderName: true,
      recipientName: true,
      recipientEmail: true,
      createdAt: true,
      redemptions: { select: { amount: true } },
    },
  });

  // Outstanding liability: what the shop still owes in frames. Worth seeing
  // at a glance, because it is real money the shop has already taken.
  const outstanding = cards
    .filter((c) => c.status === "ACTIVE")
    .reduce((sum, c) => sum + c.balance, 0);

  return (
    <>
      <p className="label text-brass">Store</p>
      <h1 className="display mt-3 text-4xl">Gift Cards</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        A card is worth exactly what was paid for it, and its balance only ever
        goes down. Cards arrive here <strong>Pending</strong> and cannot be spent until you mark
        them paid — that step is what stops a card being redeemed before the money is in.
      </p>
      {outstanding > 0 && (
        <p className="label mt-4 text-ink-muted">
          {formatPrice(outstanding)} outstanding on active cards
        </p>
      )}

      <hr className="rule-deco mt-6 mb-8" />

      <GiftCardManager
        initial={cards.map((c) => ({
          id: c.id,
          code: c.code,
          value: c.value,
          balance: c.balance,
          status: c.status,
          senderName: c.senderName,
          recipientName: c.recipientName,
          recipientEmail: c.recipientEmail,
          createdAt: c.createdAt.toISOString(),
          spent: c.redemptions.reduce((sum, r) => sum + r.amount, 0),
          redemptions: c.redemptions.length,
        }))}
      />
    </>
  );
}
