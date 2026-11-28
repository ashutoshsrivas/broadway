"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
import { GiftCardArt } from "@/components/store/GiftCardArt";
import { NumberField } from "@/components/admin/NumberField";
import { formatPrice } from "@/lib/utils";
import { GIFT_CARD_MAX, GIFT_CARD_MIN, GIFT_CARD_PRESETS } from "@/lib/gift-card";

/**
 * Build a gift card and buy it.
 *
 * The card on the left is the thing being bought, so it updates as the form
 * is filled in — the amount, the name, the message. What you see is what is
 * sent, which is the only way a gift is worth designing.
 */
export function GiftCardBuilder() {
  const [value, setValue] = useState(GIFT_CARD_PRESETS[1]);
  const [custom, setCustom] = useState("");
  const [form, setForm] = useState({
    senderName: "",
    recipientName: "",
    recipientEmail: "",
    message: "",
    buyerEmail: "",
    buyerPhone: "",
  });
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ code: string; value: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value < GIFT_CARD_MIN || value > GIFT_CARD_MAX) {
      toast.error(
        `A card can be between ${formatPrice(GIFT_CARD_MIN)} and ${formatPrice(GIFT_CARD_MAX)}.`
      );
      return;
    }

    setBusy(true);
    const res = await fetch("/api/gift-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not create that card.");
      return;
    }
    setIssued(data.card);
  };

  if (issued) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <div className="mx-auto max-w-md">
          <GiftCardArt
            value={issued.value}
            code={issued.code}
            recipientName={form.recipientName || null}
            senderName={form.senderName || null}
            message={form.message || null}
            id="issued"
          />
        </div>

        <h2 className="display mt-10 text-[clamp(1.6rem,4vw,2.4rem)]">
          Your card is reserved.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
          We&rsquo;ll be in touch on {form.buyerEmail} to take payment. The card can be spent the
          moment it clears — and it is worth exactly what you pay for it, never more.
        </p>

        <div className="mt-8 inline-flex items-center gap-3 border border-line bg-paper-raised px-6 py-4">
          <span className="label text-[0.9rem] tracking-[0.2em]">{issued.code}</span>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(issued.code);
              setCopied(true);
              toast.success("Code copied");
            }}
            aria-label="Copy the code"
            className="text-ink-muted transition-colors hover:text-brass"
          >
            {copied ? (
              <Check className="h-4 w-4 text-forest" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <p className="mt-6 text-xs text-ink-muted">
          Enter it in the gift card box at checkout. Any balance left over stays on the card.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
      {/* ── The card, as it will arrive ── */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <GiftCardArt
          value={value}
          recipientName={form.recipientName || null}
          senderName={form.senderName || null}
          message={form.message || null}
        />
        <p className="label mt-5 text-center text-[0.55rem] text-ink-muted">
          This is the card they receive
        </p>
      </div>

      {/* ── The form ── */}
      <form onSubmit={submit} className="space-y-9">
        <section>
          <h2 className="label-lg">Choose an amount</h2>
          <hr className="rule-deco mt-4 mb-6" />

          <div className="flex flex-wrap gap-2.5">
            {GIFT_CARD_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setValue(amount);
                  setCustom("");
                }}
                className={`label border px-6 py-3.5 transition-colors ${
                  value === amount && !custom
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {formatPrice(amount)}
              </button>
            ))}
          </div>

          <label className="mt-5 block">
            <span className="label text-ink-muted">Or any amount you like</span>
            <NumberField
              value={custom}
              onChange={(v) => {
                setCustom(v);
                const n = Number(v);
                if (Number.isFinite(n) && n > 0) setValue(n);
              }}
              decimals={false}
              min={GIFT_CARD_MIN}
              max={GIFT_CARD_MAX}
              placeholder={String(GIFT_CARD_MIN)}
              className="field mt-2 w-48"
              aria-label="Custom amount in rupees"
            />
            <span className="mt-2 block text-xs text-ink-muted">
              Between {formatPrice(GIFT_CARD_MIN)} and {formatPrice(GIFT_CARD_MAX)}.
            </span>
          </label>
        </section>

        <section>
          <h2 className="label-lg">Who is it for?</h2>
          <hr className="rule-deco mt-4 mb-6" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="From" required value={form.senderName} onChange={set("senderName")} placeholder="Your name" />
            <Field label="To" value={form.recipientName} onChange={set("recipientName")} placeholder="Their name" />
            <div className="sm:col-span-2">
              <Field
                label="Their email"
                type="email"
                value={form.recipientEmail}
                onChange={set("recipientEmail")}
                placeholder="So we can send it to them directly"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label block text-ink-muted">
                Message
                <textarea
                  value={form.message}
                  onChange={set("message")}
                  rows={3}
                  maxLength={500}
                  placeholder="A line to go on the card."
                  className="field mt-2 resize-none"
                />
              </label>
            </div>
          </div>
        </section>

        <section>
          <h2 className="label-lg">How we reach you</h2>
          <hr className="rule-deco mt-4 mb-6" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your email" type="email" required value={form.buyerEmail} onChange={set("buyerEmail")} />
            <Field label="Your phone" required value={form.buyerPhone} onChange={set("buyerPhone")} placeholder="+91" />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-ink-muted">
            We take payment by phone or in store, and the card goes live the moment it clears.
            It is worth exactly what you pay for it.
          </p>
        </section>

        <button type="submit" disabled={busy} className="btn-ink label w-full py-4">
          {busy ? "Reserving…" : `Create a ${formatPrice(value)} gift card`}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="label block text-ink-muted">
      {label}
      {required && <span className="ml-1 text-clay">*</span>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="field mt-2"
      />
    </label>
  );
}
