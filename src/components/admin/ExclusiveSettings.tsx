"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/**
 * The BO Exclusive copy: the badge wording, and the notice shown on every
 * exclusive product and at the top of the listing page.
 */
export function ExclusiveSettings({
  settings,
  keys,
  count,
}: {
  settings: Record<string, string | undefined>;
  keys: Record<string, string>;
  count: number;
}) {
  const router = useRouter();
  const [v, setV] = useState({
    label: settings[keys.exclusiveLabel] ?? "",
    title: settings[keys.exclusiveTitle] ?? "",
    message: settings[keys.exclusiveMessage] ?? "",
    ctaLabel: settings[keys.exclusiveCtaLabel] ?? "",
    ctaHref: settings[keys.exclusiveCtaHref] ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [keys.exclusiveLabel]: v.label,
        [keys.exclusiveTitle]: v.title,
        [keys.exclusiveMessage]: v.message,
        [keys.exclusiveCtaLabel]: v.ctaLabel,
        [keys.exclusiveCtaHref]: v.ctaHref,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast.error("Could not save.");
      return;
    }
    toast.success("BO Exclusive copy saved");
    router.refresh();
  };

  return (
    <div className="border border-line bg-paper-raised p-6 lg:p-7">
      <p className="label text-ink-muted">
        {count} product{count === 1 ? "" : "s"} currently in the selection — marked on the product
        itself, or by its whole department.
      </p>
      <hr className="rule-deco mt-4 mb-6" />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label text-ink-muted">Badge wording</span>
          <input
            value={v.label}
            onChange={(e) => setV({ ...v, label: e.target.value })}
            placeholder="BO Exclusive"
            className="field-box mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Notice heading</span>
          <input
            value={v.title}
            onChange={(e) => setV({ ...v, title: e.target.value })}
            placeholder="A Broadway Exclusive"
            className="field-box mt-1.5"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="label text-ink-muted">Message</span>
          <textarea
            value={v.message}
            onChange={(e) => setV({ ...v, message: e.target.value })}
            rows={4}
            placeholder="Shown on every BO Exclusive product and at the top of the listing page."
            className="field-box mt-1.5 resize-none"
          />
          <span className="mt-1.5 block text-[11px] text-ink-muted">
            Leave blank to use the default wording.
          </span>
        </label>

        <label className="block">
          <span className="label text-ink-muted">Button label (optional)</span>
          <input
            value={v.ctaLabel}
            onChange={(e) => setV({ ...v, ctaLabel: e.target.value })}
            placeholder="Talk to an optician"
            className="field-box mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Button link</span>
          <input
            value={v.ctaHref}
            onChange={(e) => setV({ ...v, ctaHref: e.target.value })}
            placeholder="/contact"
            className="field-box mt-1.5"
          />
        </label>
      </div>

      <button onClick={() => void save()} disabled={saving} className="btn-ink label mt-7 px-10 py-4">
        {saving ? "Saving…" : "Save BO Exclusive Copy"}
      </button>
    </div>
  );
}
