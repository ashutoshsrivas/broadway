"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { PLACEMENTS, PLACEMENT_LABELS, type Placement } from "@/lib/home-blocks";

export type BlockRow = {
  id: string;
  brandId: string;
  placement: string;
  eyebrow: string | null;
  heading: string | null;
  blurb: string | null;
  ctaLabel: string | null;
  productAId: string | null;
  productBId: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ProductOption = { id: string; name: string; brand: string | null };

export type BrandOption = {
  id: string;
  name: string;
  logoUrl: string | null;
  accentHex: string | null;
};

/**
 * The brand blocks on the homepage.
 *
 * A list rather than two fixed slots: "add another one" is the most likely
 * next request, and the storefront lays out whatever is here in order. The
 * logo and the backdrop colour come from the brand itself, under Categories
 * & Brands, so one upload serves every block for that house.
 */
export function BrandBlockManager({
  initial,
  brands,
  products,
}: {
  initial: BlockRow[];
  brands: BrandOption[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const [blocks, setBlocks] = useState(initial);
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [placement, setPlacement] = useState<Placement>(PLACEMENTS.afterRails);
  const [adding, setAdding] = useState(false);

  const byId = new Map(brands.map((b) => [b.id, b]));

  const patch = async (id: string, data: Partial<BlockRow>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    const res = await fetch(`/api/admin/brand-blocks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
      return;
    }
    router.refresh();
  };

  const create = async () => {
    if (!brandId) return;
    setAdding(true);
    const res = await fetch("/api/admin/brand-blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId, placement }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not add the block.");
      return;
    }
    setBlocks((prev) => [...prev, { ...data.block }]);
    toast.success("Brand block added");
    router.refresh();
  };

  const remove = async (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/admin/brand-blocks/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {blocks.length === 0 && (
        <p className="border border-dashed border-line py-8 text-center text-sm text-ink-muted">
          No brand blocks yet. Add one below.
        </p>
      )}

      {blocks.length > 0 && (
        <ul className="grid gap-4 lg:grid-cols-2">
          {blocks.map((block) => {
            const brand = byId.get(block.brandId);
            return (
              <li
                key={block.id}
                className={`border bg-paper-raised p-5 ${
                  block.isActive ? "border-line" : "border-dashed border-line opacity-55"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* The logo as the storefront will show it, on the brand's
                      own colour, so the contrast problem is visible here and
                      not after it goes live. */}
                  <div
                    className="flex h-14 w-24 shrink-0 items-center justify-center border border-line bg-paper"
                    style={brand?.accentHex ? { backgroundColor: brand.accentHex } : undefined}
                  >
                    {brand?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt=""
                        className={`max-h-10 max-w-[5rem] object-contain ${
                          brand.accentHex ? "brightness-0 invert" : ""
                        }`}
                      />
                    ) : (
                      <span className="label px-1 text-center text-[0.45rem] leading-tight text-ink-muted">
                        No logo
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base">
                      {brand?.name ?? "Unknown brand"}
                    </p>
                    <select
                      value={block.placement}
                      onChange={(e) => void patch(block.id, { placement: e.target.value })}
                      className="field-box mt-1.5 !text-xs"
                    >
                      {Object.values(PLACEMENTS).map((p) => (
                        <option key={p} value={p}>
                          {PLACEMENT_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {!brand?.logoUrl && (
                  <p className="label mt-3 text-[0.55rem] leading-relaxed text-clay">
                    Upload this brand&rsquo;s logo under Categories &amp; Brands — the block shows
                    its name until you do.
                  </p>
                )}

                <div className="mt-4 space-y-3">
                  <input
                    defaultValue={block.eyebrow ?? ""}
                    onBlur={(e) => {
                      const eyebrow = e.target.value.trim();
                      if (eyebrow !== (block.eyebrow ?? "")) {
                        void patch(block.id, { eyebrow: eyebrow || null });
                      }
                    }}
                    placeholder="Eyebrow — e.g. Now in store"
                    className="field-box !text-xs"
                  />
                  <input
                    defaultValue={block.heading ?? ""}
                    onBlur={(e) => {
                      const heading = e.target.value.trim();
                      if (heading !== (block.heading ?? "")) {
                        void patch(block.id, { heading: heading || null });
                      }
                    }}
                    placeholder="Heading (optional)"
                    className="field-box !text-xs"
                  />
                  <textarea
                    defaultValue={block.blurb ?? ""}
                    onBlur={(e) => {
                      const blurb = e.target.value.trim();
                      if (blurb !== (block.blurb ?? "")) {
                        void patch(block.id, { blurb: blurb || null });
                      }
                    }}
                    rows={2}
                    placeholder="A line about the house (optional)"
                    className="field-box resize-none !text-xs"
                  />
                  <input
                    defaultValue={block.ctaLabel ?? ""}
                    onBlur={(e) => {
                      const ctaLabel = e.target.value.trim();
                      if (ctaLabel !== (block.ctaLabel ?? "")) {
                        void patch(block.id, { ctaLabel: ctaLabel || null });
                      }
                    }}
                    placeholder="Button — defaults to “Shop the Brand”"
                    className="field-box !text-xs"
                  />
                </div>

                {/* Up to two frames. Choosing one moves the copy to the
                    left and puts the frames on the right; choosing neither
                    leaves the block centred as it was. */}
                <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                  {([
                    ["productAId", "First frame"],
                    ["productBId", "Second frame"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="label text-[0.55rem] text-ink-muted">{label}</span>
                      <select
                        value={block[key] ?? ""}
                        onChange={(e) =>
                          void patch(block.id, { [key]: e.target.value || null })
                        }
                        className="field-box mt-1 !text-xs"
                      >
                        <option value="">None</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.brand ? `${p.brand} — ${p.name}` : p.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
                  <button
                    onClick={() => void patch(block.id, { isActive: !block.isActive })}
                    title={block.isActive ? "Hide" : "Show"}
                    className="p-1.5 text-ink-muted transition-colors hover:text-brass"
                  >
                    {block.isActive ? (
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    onClick={() => void remove(block.id)}
                    title="Delete"
                    className="p-1.5 text-ink-muted transition-colors hover:text-clay"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <label className="block">
          <span className="label text-ink-muted">Brand</span>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="field-box mt-1.5 w-52"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="label text-ink-muted">Where</span>
          <select
            value={placement}
            onChange={(e) => setPlacement(e.target.value as Placement)}
            className="field-box mt-1.5 w-60"
          >
            {Object.values(PLACEMENTS).map((p) => (
              <option key={p} value={p}>
                {PLACEMENT_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => void create()}
          disabled={adding || !brandId}
          className="btn-ink label flex items-center gap-2 px-7 py-3"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {adding ? "Adding…" : "Add Block"}
        </button>
      </div>
    </div>
  );
}
