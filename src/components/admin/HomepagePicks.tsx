"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Option = { id: string; label: string; sub?: string };

/**
 * The two admin-picked homepage bands: which frame the must-have spotlight
 * shows, and which house "Introducing" features. Both save together.
 */
export function HomepagePicks({
  products,
  brands,
  settings,
  keys,
}: {
  products: Option[];
  brands: Option[];
  settings: Record<string, string | undefined>;
  keys: Record<string, string>;
}) {
  const router = useRouter();
  const [v, setV] = useState({
    mustHaveProductId: settings[keys.mustHaveProductId] ?? "",
    mustHaveHeading: settings[keys.mustHaveHeading] ?? "",
    introducingBrandId: settings[keys.introducingBrandId] ?? "",
    introducingEyebrow: settings[keys.introducingEyebrow] ?? "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [keys.mustHaveProductId]: v.mustHaveProductId,
        [keys.mustHaveHeading]: v.mustHaveHeading,
        [keys.introducingBrandId]: v.introducingBrandId,
        [keys.introducingEyebrow]: v.introducingEyebrow,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error("Could not save.");
      return;
    }
    toast.success("Homepage updated");
    router.refresh();
  };

  const chosenProduct = products.find((p) => p.id === v.mustHaveProductId);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="border border-line bg-paper-raised p-6">
        <h3 className="label-lg">Must-Have Spotlight</h3>
        <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
          One frame given the full width, with Add to Cart and Buy It Now. Leave the product
          blank to hide the band entirely.
        </p>
        <hr className="rule-deco mt-4 mb-5" />

        <label className="block">
          <span className="label text-ink-muted">Heading</span>
          <input
            value={v.mustHaveHeading}
            onChange={(e) => setV({ ...v, mustHaveHeading: e.target.value })}
            placeholder="Eyewear You Must Have!"
            className="field-box mt-1.5"
          />
        </label>

        <label className="mt-5 block">
          <span className="label text-ink-muted">Product</span>
          <select
            value={v.mustHaveProductId}
            onChange={(e) => setV({ ...v, mustHaveProductId: e.target.value })}
            className="field-box mt-1.5"
          >
            <option value="">— none, hide the band —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
                {p.sub ? ` · ${p.sub}` : ""}
              </option>
            ))}
          </select>
        </label>

        {chosenProduct && (
          <p className="mt-3 text-xs text-ink-muted">
            Showing <strong className="text-ink">{chosenProduct.label}</strong>
          </p>
        )}
      </section>

      <section className="border border-line bg-paper-raised p-6">
        <h3 className="label-lg">Introducing</h3>
        <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
          The four newest frames from one house, with a Shop the Brand button. Leave the brand
          blank to hide the band.
        </p>
        <hr className="rule-deco mt-4 mb-5" />

        <label className="block">
          <span className="label text-ink-muted">Eyebrow</span>
          <input
            value={v.introducingEyebrow}
            onChange={(e) => setV({ ...v, introducingEyebrow: e.target.value })}
            placeholder="Introducing"
            className="field-box mt-1.5"
          />
        </label>

        <label className="mt-5 block">
          <span className="label text-ink-muted">Brand</span>
          <select
            value={v.introducingBrandId}
            onChange={(e) => setV({ ...v, introducingBrandId: e.target.value })}
            className="field-box mt-1.5"
          >
            <option value="">— none, hide the band —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
                {b.sub ? ` · ${b.sub}` : ""}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="lg:col-span-2">
        <button onClick={() => void save()} disabled={saving} className="btn-ink label px-10 py-4">
          {saving ? "Saving…" : "Save Homepage Picks"}
        </button>
      </div>
    </div>
  );
}
