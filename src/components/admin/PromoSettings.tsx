"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/** The first-visit welcome offer: whether it runs, how much, and the wording. */
export function PromoSettings({
  settings,
  keys,
}: {
  settings: Record<string, string | undefined>;
  keys: Record<string, string>;
}) {
  const router = useRouter();
  const [v, setV] = useState({
    enabled: settings[keys.promoEnabled] === "1",
    percent: settings[keys.promoPercent] ?? "10",
    code: settings[keys.promoCode] ?? "WELCOME10",
    heading: settings[keys.promoHeading] ?? "",
    message: settings[keys.promoMessage] ?? "",
    delay: settings[keys.promoDelay] ?? "6",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // An empty string deletes the row, which is how "off" is stored.
        [keys.promoEnabled]: v.enabled ? "1" : "",
        [keys.promoPercent]: v.percent,
        [keys.promoCode]: v.code.trim().toUpperCase(),
        [keys.promoHeading]: v.heading,
        [keys.promoMessage]: v.message,
        [keys.promoDelay]: v.delay,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save.");
      return;
    }
    toast.success("Welcome offer saved");
    router.refresh();
  };

  return (
    <div className="border border-line bg-paper-raised p-6 lg:p-7">
      <button
        type="button"
        onClick={() => setV({ ...v, enabled: !v.enabled })}
        aria-pressed={v.enabled}
        className={`flex w-full items-center gap-3.5 border p-4 text-left transition-colors sm:w-auto sm:pr-10 ${
          v.enabled ? "border-brass bg-brass/10" : "border-line hover:border-ink-muted"
        }`}
      >
        <span
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
            v.enabled ? "bg-brass" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition-all ${
              v.enabled ? "left-[1.125rem]" : "left-0.5"
            }`}
          />
        </span>
        <span>
          <span className="label block">{v.enabled ? "Offer is running" : "Offer is off"}</span>
          <span className="mt-1 block text-xs text-ink-muted">
            Shown once to each first-time visitor
          </span>
        </span>
      </button>

      <hr className="rule-deco my-6" />

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block">
          <span className="label text-ink-muted">Discount %</span>
          <input
            type="number"
            min="0"
            max="50"
            value={v.percent}
            onChange={(e) => setV({ ...v, percent: e.target.value })}
            className="field-box mt-1.5"
          />
          <span className="mt-1.5 block text-[11px] text-ink-muted">Capped at 50%.</span>
        </label>

        <label className="block">
          <span className="label text-ink-muted">Code</span>
          <input
            value={v.code}
            onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })}
            placeholder="WELCOME10"
            className="field-box mt-1.5 uppercase"
          />
        </label>

        <label className="block">
          <span className="label text-ink-muted">Show after (seconds)</span>
          <input
            type="number"
            min="0"
            max="60"
            value={v.delay}
            onChange={(e) => setV({ ...v, delay: e.target.value })}
            className="field-box mt-1.5"
          />
        </label>

        <label className="block sm:col-span-3">
          <span className="label text-ink-muted">Heading</span>
          <input
            value={v.heading}
            onChange={(e) => setV({ ...v, heading: e.target.value })}
            placeholder="Welcome to Broadway"
            className="field-box mt-1.5"
          />
        </label>

        <label className="block sm:col-span-3">
          <span className="label text-ink-muted">Message</span>
          <textarea
            value={v.message}
            onChange={(e) => setV({ ...v, message: e.target.value })}
            rows={3}
            placeholder="Take {percent}% off your first order…"
            className="field-box mt-1.5 resize-none"
          />
          <span className="mt-1.5 block text-[11px] text-ink-muted">
            Write <code className="text-brass">{"{percent}"}</code> and it is replaced with the
            number above, so changing the discount never leaves stale wording behind.
          </span>
        </label>
      </div>

      <button onClick={() => void save()} disabled={saving} className="btn-ink label mt-7 px-10 py-4">
        {saving ? "Saving…" : "Save Welcome Offer"}
      </button>

      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
        The code is checked again when the order is placed — it only applies to an email address
        that has never ordered before, so it cannot become a standing discount.
      </p>
    </div>
  );
}
