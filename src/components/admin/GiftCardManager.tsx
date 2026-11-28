"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/utils";
import { NumberField } from "@/components/admin/NumberField";

export type GiftCardRow = {
  id: string;
  code: string;
  value: number;
  balance: number;
  status: string;
  senderName: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  createdAt: string;
  spent: number;
  redemptions: number;
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-brass/50 text-brass",
  ACTIVE: "border-forest/40 text-forest",
  SPENT: "border-line text-ink-muted",
  VOID: "border-clay/40 text-clay",
};

/**
 * The gift cards, and the one decision that matters: has the money arrived?
 *
 * A card is issued PENDING and cannot be spent until someone here says it is
 * paid for. That is deliberately a human step — it is the thing standing
 * between the shop and a card being redeemed before it was bought.
 */
export function GiftCardManager({ initial }: { initial: GiftCardRow[] }) {
  const router = useRouter();
  const [cards, setCards] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const patch = async (id: string, data: { status?: string; balance?: number }) => {
    setBusy(id);
    const res = await fetch(`/api/admin/gift-cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setBusy(null);

    if (!res.ok) {
      toast.error(body.error ?? "Could not save that.");
      router.refresh();
      return;
    }
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: body.card.status, balance: body.card.balance } : c))
    );
    toast.success("Saved");
    router.refresh();
  };

  if (cards.length === 0) {
    return (
      <div className="border border-dashed border-line px-6 py-16 text-center">
        <p className="display text-2xl">No gift cards yet</p>
        <p className="mt-2.5 text-sm text-ink-muted">
          They appear here the moment someone buys one at{" "}
          <code className="text-brass">/gift-cards</code>.
        </p>
      </div>
    );
  }

  const pending = cards.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-5">
      {pending > 0 && (
        <p className="label border border-brass/40 bg-brass/10 px-4 py-3 text-[0.6rem] leading-relaxed text-ink-soft">
          {pending} card{pending === 1 ? "" : "s"} waiting on payment. Mark one Paid once the
          money is in — until then it cannot be spent.
        </p>
      )}

      <div className="overflow-x-auto border border-line bg-paper-raised">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="label px-5 py-3.5 text-left text-ink-muted">Code</th>
              <th className="label px-5 py-3.5 text-left text-ink-muted">For</th>
              <th className="label px-5 py-3.5 text-right text-ink-muted">Paid</th>
              <th className="label px-5 py-3.5 text-right text-ink-muted">Balance</th>
              <th className="label px-5 py-3.5 text-left text-ink-muted">Status</th>
              <th className="label px-5 py-3.5 text-right text-ink-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {cards.map((card) => (
              <tr key={card.id} className={card.status === "VOID" ? "opacity-55" : undefined}>
                <td className="px-5 py-3.5">
                  <p className="label tracking-[0.14em]">{card.code}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(card.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {card.redemptions > 0 && ` · used ${card.redemptions}×`}
                  </p>
                </td>

                <td className="px-5 py-3.5 text-ink-soft">
                  {card.recipientName ?? "—"}
                  <span className="mt-1 block text-xs text-ink-muted">
                    {card.senderName ? `from ${card.senderName}` : ""}
                    {card.recipientEmail ? ` · ${card.recipientEmail}` : ""}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-right tabular-nums">{formatPrice(card.value)}</td>

                <td className="px-5 py-3.5 text-right">
                  <NumberField
                    value={card.balance}
                    min={0}
                    max={card.value}
                    disabled={busy === card.id}
                    onCommit={(v) => {
                      const next = Number(v);
                      if (!Number.isFinite(next) || next === card.balance) return;
                      void patch(card.id, { balance: next });
                    }}
                    aria-label={`Balance on ${card.code}`}
                    className="field-box w-28 text-right !text-xs"
                  />
                  {card.spent > 0 && (
                    <span className="mt-1 block text-xs text-ink-muted">
                      {formatPrice(card.spent)} spent
                    </span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`label border px-2.5 py-1.5 ${
                      STATUS_STYLE[card.status] ?? "border-line text-ink-muted"
                    }`}
                  >
                    {card.status}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-4">
                    {card.status === "PENDING" && (
                      <button
                        onClick={() => void patch(card.id, { status: "ACTIVE" })}
                        disabled={busy === card.id}
                        className="label text-forest hover:underline"
                      >
                        Mark paid
                      </button>
                    )}
                    {card.status === "ACTIVE" && (
                      <button
                        onClick={() => void patch(card.id, { status: "PENDING" })}
                        disabled={busy === card.id}
                        className="label text-ink-muted hover:text-ink"
                      >
                        Hold
                      </button>
                    )}
                    {card.status !== "VOID" ? (
                      <button
                        onClick={() => {
                          if (!window.confirm(`Cancel ${card.code}? It can no longer be spent.`)) return;
                          void patch(card.id, { status: "VOID" });
                        }}
                        disabled={busy === card.id}
                        className="label text-ink-muted hover:text-clay"
                      >
                        Void
                      </button>
                    ) : (
                      <button
                        onClick={() => void patch(card.id, { status: "ACTIVE" })}
                        disabled={busy === card.id}
                        className="label text-ink-muted hover:text-ink"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
