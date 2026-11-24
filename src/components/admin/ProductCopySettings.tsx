"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SETTING_KEYS } from "@/lib/settings";
import { PRODUCT_BLOCK_TITLES } from "@/lib/product-copy";

type Settings = Partial<Record<string, string>>;

/**
 * The standing blocks on every product page.
 *
 * Left blank, each one falls back to the wording the site ships with, which
 * is shown here as the placeholder — so the shop can see what customers are
 * being told before deciding to change it.
 */
export function ProductCopySettings({ settings }: { settings: Settings }) {
  const router = useRouter();

  const save = async (key: string, value: string) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      toast.error("Could not save.");
      router.refresh();
      return;
    }
    toast.success("Saved");
    router.refresh();
  };

  const area = (key: string, label: string, hint: string, rows = 3) => {
    const current = settings[key] ?? "";
    return (
      <label key={key} className="block">
        <span className="label text-ink-muted">{label}</span>
        <textarea
          defaultValue={current}
          placeholder={hint}
          rows={rows}
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value !== current) void save(key, value);
          }}
          className="field-box mt-1.5 resize-y !text-xs"
        />
      </label>
    );
  };

  return (
    <div className="space-y-5 border border-line bg-paper-raised p-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block">
          <span className="label text-ink-muted">&ldquo;Need assistance?&rdquo; heading</span>
          <input
            defaultValue={settings[SETTING_KEYS.productAssistHeading] ?? ""}
            placeholder="Need assistance?"
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (value !== (settings[SETTING_KEYS.productAssistHeading] ?? "")) {
                void save(SETTING_KEYS.productAssistHeading, value);
              }
            }}
            className="field-box mt-1.5 !text-xs"
          />
        </label>

        <label className="block">
          <span className="label text-ink-muted">The line under it</span>
          <input
            defaultValue={settings[SETTING_KEYS.productAssistNote] ?? ""}
            placeholder="An optician can tell you how this frame sits…"
            onBlur={(e) => {
              const value = e.target.value.trim();
              if (value !== (settings[SETTING_KEYS.productAssistNote] ?? "")) {
                void save(SETTING_KEYS.productAssistNote, value);
              }
            }}
            className="field-box mt-1.5 !text-xs"
          />
        </label>
      </div>

      <div className="grid gap-4 border-t border-line pt-5 lg:grid-cols-2">
        {[
          SETTING_KEYS.productAuthenticity,
          SETTING_KEYS.productWarranty,
          SETTING_KEYS.productShipping,
          SETTING_KEYS.productAfterSales,
        ].map((key) =>
          area(key, PRODUCT_BLOCK_TITLES[key] ?? key, "Leave blank to keep the current wording", 4)
        )}
      </div>

      <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
        These four appear as collapsible sections on every product page, under Specifications,
        Description and About the brand. The brand paragraph comes from the brand itself, under
        Categories &amp; Brands.
      </p>
    </div>
  );
}
