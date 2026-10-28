"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Plus, Trash2, X } from "lucide-react";

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  tileUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  isFeatured: boolean;
  showInNewArrivals: boolean;
  showInBrandStrip: boolean;
  productCount: number;
};

/**
 * Brands, with the image each one shows in the strip and the three shelves it
 * can appear on. Edits save on the spot — there is no form to submit, because
 * the whole job here is flipping a few switches and dropping in a logo.
 */
export function BrandManager({ initial }: { initial: BrandRow[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initial);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);

  const patch = async (id: string, data: Partial<BrandRow>) => {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    const res = await fetch(`/api/admin/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setAdding(true);
    const res = await fetch("/api/admin/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not add the brand.");
      return;
    }
    setBrands((prev) => [
      ...prev,
      { ...data.brand, showInBrandStrip: false, showInNewArrivals: false, productCount: 0 },
    ]);
    setName("");
    toast.success(`${data.brand.name} added`);
    router.refresh();
  };

  const remove = async (brand: BrandRow) => {
    if (brand.productCount > 0) {
      toast.error(`${brand.productCount} product(s) still use ${brand.name}.`);
      return;
    }
    if (!window.confirm(`Delete ${brand.name}?`)) return;

    const res = await fetch(`/api/admin/brands/${brand.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete the brand.");
      return;
    }
    setBrands((prev) => prev.filter((b) => b.id !== brand.id));
    toast.success("Brand deleted");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {brands.map((brand) => (
          <li key={brand.id} className="border border-line bg-paper-raised p-5">
            <div className="flex items-start gap-4">
              <BrandImage
                label="Logo"
                url={brand.logoUrl}
                hint="Transparent PNG"
                onChange={(logoUrl) => void patch(brand.id, { logoUrl })}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg">{brand.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {brand.slug} · {brand.productCount} product
                  {brand.productCount === 1 ? "" : "s"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void remove(brand)}
                title="Delete brand"
                className="-mr-1 p-1.5 text-ink-muted transition-colors hover:text-clay"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mt-4 flex gap-3 border-t border-line pt-4">
              <BrandImage
                label="Strip photo"
                url={brand.tileUrl}
                hint="Lifestyle shot"
                onChange={(tileUrl) => void patch(brand.id, { tileUrl })}
              />
              <BrandImage
                label="Page banner"
                url={brand.bannerUrl}
                hint="Wide"
                onChange={(bannerUrl) => void patch(brand.id, { bannerUrl })}
              />
            </div>

            <label className="mt-4 block">
              <span className="label text-[0.55rem] text-ink-muted">About the house</span>
              <textarea
                defaultValue={brand.description ?? ""}
                onBlur={(e) => {
                  const description = e.target.value.trim();
                  if (description !== (brand.description ?? "")) {
                    void patch(brand.id, { description: description || null });
                  }
                }}
                rows={3}
                placeholder="Shown under the banner on the brand page."
                className="field-box mt-1 resize-none !text-xs"
              />
            </label>

            <div className="mt-4 space-y-2.5 border-t border-line pt-4">
              <Toggle
                label="Brand strip"
                hint={!brand.tileUrl ? "Needs a strip photo" : undefined}
                checked={brand.showInBrandStrip}
                disabled={!brand.tileUrl}
                onChange={(v) => void patch(brand.id, { showInBrandStrip: v })}
              />
              <Toggle
                label="Arrivals deck"
                checked={brand.showInNewArrivals}
                onChange={(v) => void patch(brand.id, { showInNewArrivals: v })}
              />
              <Toggle
                label="Featured roll-call"
                checked={brand.isFeatured}
                onChange={(v) => void patch(brand.id, { isFeatured: v })}
              />
            </div>
          </li>
        ))}
      </ul>

      <form onSubmit={create} className="flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <label className="block">
          <span className="label text-ink-muted">New brand</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ray-Ban"
            className="field-box mt-1.5 w-56"
          />
        </label>
        <button
          type="submit"
          disabled={adding || !name.trim()}
          className="btn-ink label flex items-center gap-2 px-7 py-3"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {adding ? "Adding…" : "Add Brand"}
        </button>
      </form>
    </div>
  );
}

function BrandImage({
  label,
  url,
  hint,
  onChange,
}: {
  label: string;
  url: string | null;
  hint?: string;
  onChange: (url: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Upload failed.");
      return;
    }
    onChange(data.url);
  };

  return (
    <div className="relative">
      <span className="label mb-1 block text-[0.5rem] text-ink-muted">{label}</span>
      <label
        title={hint ? `${label} — ${hint}` : label}
        className="relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden border border-dashed border-line bg-paper transition-colors hover:border-brass"
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-contain p-1.5" />
        ) : (
          <Upload className="h-4 w-4 text-ink-muted" strokeWidth={1.5} />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => void upload(e.target.files)}
          className="sr-only"
        />
      </label>

      {busy && (
        <span className="label absolute bottom-0 left-0 flex h-16 w-16 items-center justify-center bg-paper/85 text-[0.5rem] text-brass">
          …
        </span>
      )}

      {url && !busy && (
        <button
          type="button"
          onClick={() => onChange(null)}
          title="Remove image"
          className="absolute -right-1.5 top-4 flex h-5 w-5 items-center justify-center rounded-full border border-line bg-paper text-ink-muted transition-colors hover:text-clay"
        >
          <X className="h-2.5 w-2.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label
      className={`label flex items-center justify-between gap-3 ${
        disabled ? "cursor-not-allowed text-ink-muted/50" : "cursor-pointer text-ink-soft"
      }`}
    >
      <span>
        {label}
        {hint && <span className="ml-2 text-[0.55rem] text-clay">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-[#B08D4F]"
      />
    </label>
  );
}
