"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { titleCase } from "@/lib/utils";
import { NumberField } from "@/components/admin/NumberField";

const FRAME_TYPES = ["FULL_RIM", "HALF_RIM", "RIMLESS"];
const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];

type VariantDraft = {
  id?: string;
  sku: string;
  colorName: string;
  colorHex: string;
  priceOverride: string;
  stock: string;
};

export type ProductFormValues = {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  brandId: string;
  mrp: string;
  price: string;
  gender: string;
  shape: string;
  material: string;
  size: string;
  countryOfOrigin: string;
  frameType: string;
  lensType: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimitedEdition: boolean;
  isBoExclusive: boolean;
  images: string[];
  variants: VariantDraft[];
};

export const BLANK_PRODUCT: ProductFormValues = {
  name: "",
  description: "",
  categoryId: "",
  brandId: "",
  mrp: "",
  price: "",
  gender: "Unisex",
  shape: "",
  material: "",
  size: "",
  countryOfOrigin: "",
  frameType: "",
  lensType: "",
  status: "DRAFT",
  isFeatured: false,
  isNewArrival: false,
  isLimitedEdition: false,
  isBoExclusive: false,
  images: [],
  variants: [{ sku: "", colorName: "", colorHex: "#2A1F17", priceOverride: "", stock: "0" }],
};

export function ProductForm({
  initial,
  categories,
  brands,
}: {
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const setVariant = (index: number, patch: Partial<VariantDraft>) =>
    setValues((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);

    // Uploaded one at a time so a single rejected file (wrong type, too large)
    // doesn't discard the others.
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? `Could not upload ${file.name}`);
        continue;
      }
      setValues((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    }

    setUploading(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // Numbers arrive from the form as strings; the API schema wants real
    // numbers, and empty optional fields must be null rather than "".
    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      categoryId: values.categoryId,
      brandId: values.brandId || null,
      mrp: Number(values.mrp),
      price: Number(values.price),
      gender: values.gender.trim() || "Unisex",
      shape: values.shape.trim() || null,
      material: values.material.trim() || null,
      size: values.size.trim() || null,
      countryOfOrigin: values.countryOfOrigin.trim() || null,
      frameType: values.frameType || null,
      lensType: values.lensType.trim() || null,
      status: values.status,
      isFeatured: values.isFeatured,
      isNewArrival: values.isNewArrival,
      isLimitedEdition: values.isLimitedEdition,
      isBoExclusive: values.isBoExclusive,
      images: values.images,
      variants: values.variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        colorName: v.colorName.trim(),
        colorHex: v.colorHex || undefined,
        priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
        stock: Number(v.stock || 0),
      })),
    };

    const res = await fetch(
      values.id ? `/api/admin/products/${values.id}` : "/api/admin/products",
      {
        method: values.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save the product.");
      return;
    }

    toast.success(values.id ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-10">
      {/* ── Basics ── */}
      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label text="Product name">
              <input
                value={values.name}
                onChange={(e) => set("name", e.target.value)}
                required
                placeholder="0RB 3025 Aviator Classic"
                className="field-box"
              />
            </Label>
          </div>

          <Label text="Category">
            <select
              value={values.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
              className="field-box"
            >
              <option value="">Select a category…</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Brand">
            <select
              value={values.brandId}
              onChange={(e) => set("brandId", e.target.value)}
              className="field-box"
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </Label>

          <div className="sm:col-span-2">
            <Label text="Description">
              <textarea
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                className="field-box resize-none"
              />
            </Label>
          </div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section title="Pricing">
        <div className="grid gap-5 sm:grid-cols-2">
          <Label text="MRP (₹)" hint="The printed list price">
            <NumberField value={values.mrp} onChange={(v) => set("mrp", v)} min={0} />
          </Label>
          <Label text="Selling price (₹)" hint="Below MRP shows a SAVE % badge">
            <NumberField value={values.price} onChange={(v) => set("price", v)} min={0} />
          </Label>
        </div>
      </Section>

      {/* ── Eyewear attributes ── */}
      <Section title="Frame Details" note="These drive the shop filters.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Label text="For" hint="Free text — use Uploads for list suggestions">
            <input
              value={values.gender}
              onChange={(e) => set("gender", e.target.value)}
              placeholder="Unisex"
              className="field-box"
            />
          </Label>

          <Label text="Shape">
            <input
              value={values.shape}
              onChange={(e) => set("shape", e.target.value)}
              placeholder="Aviator"
              className="field-box"
            />
          </Label>

          <Label text="Rim">
            <select
              value={values.frameType}
              onChange={(e) => set("frameType", e.target.value)}
              className="field-box"
            >
              <option value="">—</option>
              {FRAME_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </select>
          </Label>

          <Label text="Material">
            <input
              value={values.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="Acetate"
              className="field-box"
            />
          </Label>

          <Label text="Size">
            <input
              value={values.size}
              onChange={(e) => set("size", e.target.value)}
              placeholder="52-18-140"
              className="field-box"
            />
          </Label>

          <Label text="Country of origin">
            <input
              value={values.countryOfOrigin}
              onChange={(e) => set("countryOfOrigin", e.target.value)}
              placeholder="Italy"
              className="field-box"
            />
          </Label>

          <Label text="Lens type">
            <input
              value={values.lensType}
              onChange={(e) => set("lensType", e.target.value)}
              placeholder="Polarised, Blue-cut…"
              className="field-box"
            />
          </Label>
        </div>
      </Section>

      {/* ── Images ── */}
      <Section title="Images" note="The header image is what shows on the shop grid and at the top of the product page. Hover any other image to promote it.">
        {values.images.length > 0 && (
          <ul className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {values.images.map((url, i) => (
              <li
                key={url}
                className={`group relative aspect-square overflow-hidden bg-paper-sunk ${
                  i === 0 ? "ring-2 ring-brass" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />

                {i === 0 ? (
                  <span className="label absolute left-1.5 top-1.5 bg-brass px-2 py-1 text-[0.5rem] text-ink">
                    Header
                  </span>
                ) : (
                  // The header is simply the first image, so choosing one is
                  // moving it to the front — the storefront needs no extra
                  // field to read, and the order stays the single source.
                  <button
                    type="button"
                    onClick={() =>
                      set("images", [url, ...values.images.filter((_, index) => index !== i)])
                    }
                    title="Use as header image"
                    className="label absolute inset-x-1.5 bottom-1.5 bg-ink/85 py-1.5 text-[0.5rem] text-paper opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Set as header
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    set("images", values.images.filter((_, index) => index !== i))
                  }
                  className="absolute right-1.5 top-1.5 bg-ink/80 p-1.5 text-paper opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <label className="label flex cursor-pointer items-center justify-center gap-2.5 border border-dashed border-line py-7 text-ink-muted transition-colors hover:border-brass hover:text-brass">
          <Upload className="h-4 w-4" strokeWidth={1.5} />
          {uploading ? "Uploading…" : "Upload Images"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="sr-only"
          />
        </label>
      </Section>

      {/* ── Variants ── */}
      <Section
        title="Colourways"
        note="Stock is held per colour. Every product needs at least one."
      >
        <ul className="space-y-4">
          {values.variants.map((variant, i) => (
            <li key={i} className="border border-line bg-paper p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_1fr_1fr_auto] sm:items-end">
                <Label text="SKU">
                  <input
                    value={variant.sku}
                    onChange={(e) => setVariant(i, { sku: e.target.value })}
                    required
                    placeholder="RB3025-GLD"
                    className="field-box"
                  />
                </Label>

                <Label text="Colour name">
                  <input
                    value={variant.colorName}
                    onChange={(e) => setVariant(i, { colorName: e.target.value })}
                    required
                    placeholder="Gold / Green"
                    className="field-box"
                  />
                </Label>

                <Label text="Swatch">
                  <input
                    type="color"
                    value={variant.colorHex}
                    onChange={(e) => setVariant(i, { colorHex: e.target.value })}
                    className="h-[38px] w-14 cursor-pointer border border-line bg-paper-raised p-1"
                  />
                </Label>

                <Label text="Stock">
                  <NumberField
                    value={variant.stock}
                    onChange={(v) => setVariant(i, { stock: v })}
                    decimals={false}
                    min={0}
                  />
                </Label>

                <Label text="Price override" hint="Blank = product price">
                  <NumberField
                    value={variant.priceOverride}
                    onChange={(v) => setVariant(i, { priceOverride: v })}
                    min={0}
                  />
                </Label>

                <button
                  type="button"
                  onClick={() =>
                    set("variants", values.variants.filter((_, index) => index !== i))
                  }
                  disabled={values.variants.length === 1}
                  className="mb-1 p-2 text-ink-muted transition-colors hover:text-clay disabled:opacity-30"
                  aria-label="Remove colourway"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() =>
            set("variants", [
              ...values.variants,
              { sku: "", colorName: "", colorHex: "#2A1F17", priceOverride: "", stock: "0" },
            ])
          }
          className="label mt-4 flex items-center gap-2 text-brass"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          Add a colourway
        </button>
      </Section>

      {/* ── Visibility ── */}
      <Section title="Visibility">
        <div className="grid gap-5 sm:grid-cols-2">
          <Label text="Status" hint="Only ACTIVE products appear in the shop">
            <select
              value={values.status}
              onChange={(e) => set("status", e.target.value)}
              className="field-box"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {titleCase(status)}
                </option>
              ))}
            </select>
          </Label>

          <div className="space-y-3.5 sm:pt-6">
            <label className="flex items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="h-4 w-4 accent-[#B08D4F]"
              />
              Show in Featured Picks on the homepage
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={values.isNewArrival}
                onChange={(e) => set("isNewArrival", e.target.checked)}
                className="h-4 w-4 accent-[#B08D4F]"
              />
              Mark as a new arrival
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={values.isLimitedEdition}
                onChange={(e) => set("isLimitedEdition", e.target.checked)}
                className="h-4 w-4 accent-[#B08D4F]"
              />
              Limited edition
            </label>
            <label className="flex items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                checked={values.isBoExclusive}
                onChange={(e) => set("isBoExclusive", e.target.checked)}
                className="h-4 w-4 accent-[#B08D4F]"
              />
              BO Exclusive
            </label>
          </div>
        </div>
      </Section>

      {error && (
        <p className="border border-clay/40 bg-clay/5 px-5 py-4 text-sm text-clay">{error}</p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-7">
        <button type="submit" disabled={submitting} className="btn-ink label px-10 py-4">
          {submitting ? "Saving…" : values.id ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="btn-outline label px-10 py-4"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-paper-raised p-6 lg:p-7">
      <h2 className="label-lg">{title}</h2>
      {note && <p className="mt-2 text-xs text-ink-muted">{note}</p>}
      <hr className="rule-deco mt-4 mb-6" />
      {children}
    </section>
  );
}

function Label({
  text,
  hint,
  children,
}: {
  text: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label text-ink-muted">{text}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1.5 block text-xs text-ink-muted">{hint}</span>}
    </label>
  );
}
