"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, X, Sparkles, Check } from "lucide-react";
import { AttributeCombobox } from "@/components/admin/AttributeCombobox";
import type { Candidate, Kind } from "@/lib/attributes";
import { formatPrice, discountPct } from "@/lib/utils";

type Vocab = Record<Kind, Candidate[]>;

const BLANK = {
  name: "",
  description: "",
  brand: "",
  category: "",
  mrp: "",
  price: "",
  gender: "",
  colour: "",
  material: "",
  shape: "",
  size: "",
  countryOfOrigin: "",
  sku: "",
  stock: "0",
  isLimitedEdition: false,
  isBoExclusive: false,
  images: [] as string[],
};

export function UploadForm({
  attributes,
  brands,
  categories,
}: {
  attributes: Vocab;
  brands: Candidate[];
  categories: Candidate[];
}) {
  const router = useRouter();
  const [v, setV] = useState(BLANK);
  const [vocab, setVocab] = useState<Vocab>(attributes);
  const [brandList, setBrandList] = useState(brands);
  const [categoryList, setCategoryList] = useState(categories);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof typeof BLANK>(key: K, value: (typeof BLANK)[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  /** A combobox coined a new word — add it locally so it is immediately offered. */
  const onCreated = (kind: Kind, value: Candidate) =>
    setVocab((prev) => ({ ...prev, [kind]: [...prev[kind], value] }));

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? `Could not upload ${file.name}`);
        continue;
      }
      setV((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    }
    setUploading(false);
  };

  const submit = async (status: "ACTIVE" | "DRAFT") => {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: v.name.trim(),
        description: v.description.trim() || undefined,
        brand: v.brand.trim() || undefined,
        category: v.category.trim(),
        mrp: Number(v.mrp),
        price: Number(v.price || v.mrp),
        gender: v.gender.trim() || undefined,
        colour: v.colour.trim(),
        material: v.material.trim() || undefined,
        shape: v.shape.trim() || undefined,
        size: v.size.trim() || undefined,
        countryOfOrigin: v.countryOfOrigin.trim() || undefined,
        sku: v.sku.trim() || undefined,
        stock: Number(v.stock || 0),
        isLimitedEdition: v.isLimitedEdition,
        isBoExclusive: v.isBoExclusive,
        images: v.images,
        status,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save the product.");
      return;
    }

    toast.success(`${data.product.name} is live`);
    // Keep brand and category — uploading a run of one brand is the common case.
    setV({ ...BLANK, brand: v.brand, category: v.category, gender: v.gender });
    router.refresh();
  };

  const mrp = Number(v.mrp) || 0;
  const price = Number(v.price) || 0;
  const save = discountPct(mrp, price);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit("ACTIVE");
      }}
      className="max-w-5xl space-y-6"
    >
      {/* ── The lists ── */}
      <section className="border border-line bg-paper-raised p-6 lg:p-7">
        <h2 className="label-lg">Product</h2>
        <hr className="rule-deco mt-4 mb-6" />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label block text-ink-muted">
              Name <span className="ml-1 text-clay">*</span>
            </label>
            <input
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="0RB 3025 Aviator Classic"
              className="field-box mt-1.5"
            />
          </div>

          <AttributeCombobox
            kind="GENDER"
            label="Gender"
            value={v.gender}
            onChange={(x) => set("gender", x)}
            options={vocab.GENDER}
            onCreated={onCreated}
            placeholder="Unisex"
            hint="Men, Women, Kids, Unisex — or anything else"
          />

          {/* Brand and category are their own tables, so they create rows there
              rather than in the attribute vocabulary. Same typing behaviour. */}
          <AttributeCombobox
            kind="GENDER"
            label="Brand"
            value={v.brand}
            onChange={(x) => set("brand", x)}
            options={brandList}
            onCreated={(_, value) => setBrandList((prev) => [...prev, value])}
            placeholder="Ray-Ban"
            hint="A new brand is created on save"
          />

          <AttributeCombobox
            kind="GENDER"
            label="Category"
            value={v.category}
            onChange={(x) => set("category", x)}
            options={categoryList}
            onCreated={(_, value) => setCategoryList((prev) => [...prev, value])}
            placeholder="Sunglasses"
            required
            hint="A new category is created on save"
          />

          <AttributeCombobox
            kind="COLOUR"
            label="Colour"
            value={v.colour}
            onChange={(x) => set("colour", x)}
            options={vocab.COLOUR}
            onCreated={onCreated}
            placeholder="Gold / Green"
            required
          />

          <AttributeCombobox
            kind="MATERIAL"
            label="Material"
            value={v.material}
            onChange={(x) => set("material", x)}
            options={vocab.MATERIAL}
            onCreated={onCreated}
            placeholder="Acetate"
          />

          <AttributeCombobox
            kind="SHAPE"
            label="Shape"
            value={v.shape}
            onChange={(x) => set("shape", x)}
            options={vocab.SHAPE}
            onCreated={onCreated}
            placeholder="Aviator"
          />

          <AttributeCombobox
            kind="SIZE"
            label="Size"
            value={v.size}
            onChange={(x) => set("size", x)}
            options={vocab.SIZE}
            onCreated={onCreated}
            placeholder="52-18-140"
          />

          <AttributeCombobox
            kind="ORIGIN"
            label="Country of origin"
            value={v.countryOfOrigin}
            onChange={(x) => set("countryOfOrigin", x)}
            options={vocab.ORIGIN}
            onCreated={onCreated}
            placeholder="Italy"
          />
        </div>

        {/* ── Flags ── */}
        <button
          type="button"
          onClick={() => set("isBoExclusive", !v.isBoExclusive)}
          aria-pressed={v.isBoExclusive}
          className={`mt-6 flex w-full items-center gap-3.5 border p-4 text-left transition-colors sm:w-auto sm:pr-8 ${
            v.isBoExclusive ? "border-brass bg-brass/10" : "border-line hover:border-ink-muted"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
              v.isBoExclusive ? "border-brass bg-brass" : "border-line"
            }`}
          >
            {v.isBoExclusive && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
          </span>
          <Sparkles
            className={`h-4 w-4 shrink-0 ${v.isBoExclusive ? "text-brass" : "text-ink-muted"}`}
            strokeWidth={1.5}
          />
          <span>
            <span className="label block">BO Exclusive</span>
            <span className="mt-1 block text-xs text-ink-muted">
              Lists it under BO Exclusive and shows the house notice on the product
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => set("isLimitedEdition", !v.isLimitedEdition)}
          aria-pressed={v.isLimitedEdition}
          className={`mt-3 flex w-full items-center gap-3.5 border p-4 text-left transition-colors sm:w-auto sm:pr-8 ${
            v.isLimitedEdition
              ? "border-brass bg-brass/10"
              : "border-line hover:border-ink-muted"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
              v.isLimitedEdition ? "border-brass bg-brass" : "border-line"
            }`}
          >
            {v.isLimitedEdition && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
          </span>
          <Sparkles
            className={`h-4 w-4 shrink-0 ${v.isLimitedEdition ? "text-brass" : "text-ink-muted"}`}
            strokeWidth={1.5}
          />
          <span>
            <span className="label block">Limited Edition</span>
            <span className="mt-1 block text-xs text-ink-muted">
              Flags the frame as a limited run on the storefront
            </span>
          </span>
        </button>
      </section>

      {/* ── Pricing and stock ── */}
      <section className="border border-line bg-paper-raised p-6 lg:p-7">
        <h2 className="label-lg">Price &amp; Stock</h2>
        <hr className="rule-deco mt-4 mb-6" />

        <div className="grid gap-5 sm:grid-cols-4">
          <label className="block">
            <span className="label text-ink-muted">
              MRP (₹) <span className="ml-1 text-clay">*</span>
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={v.mrp}
              onChange={(e) => set("mrp", e.target.value)}
              required
              className="field-box mt-1.5"
            />
          </label>

          <label className="block">
            <span className="label text-ink-muted">Selling price (₹)</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={v.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder={v.mrp || "same as MRP"}
              className="field-box mt-1.5"
            />
            {save > 0 && (
              <span className="mt-1.5 block text-[11px] text-clay">
                Shows as SAVE {save}% · {formatPrice(price)}
              </span>
            )}
          </label>

          <label className="block">
            <span className="label text-ink-muted">Stock</span>
            <input
              type="number"
              min="0"
              value={v.stock}
              onChange={(e) => set("stock", e.target.value)}
              className="field-box mt-1.5"
            />
          </label>

          <label className="block">
            <span className="label text-ink-muted">SKU</span>
            <input
              value={v.sku}
              onChange={(e) => set("sku", e.target.value)}
              placeholder="auto"
              className="field-box mt-1.5"
            />
            <span className="mt-1.5 block text-[11px] text-ink-muted">Generated if blank</span>
          </label>
        </div>
      </section>

      {/* ── Images and description ── */}
      <section className="border border-line bg-paper-raised p-6 lg:p-7">
        <h2 className="label-lg">Images &amp; Description</h2>
        <hr className="rule-deco mt-4 mb-6" />

        {v.images.length > 0 && (
          <ul className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {v.images.map((url, i) => (
              <li key={url} className="group relative aspect-square overflow-hidden bg-paper-sunk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="label absolute left-1.5 top-1.5 bg-ink px-2 py-1 text-[0.5rem] text-paper">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => set("images", v.images.filter((_, n) => n !== i))}
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

        <label className="mt-5 block">
          <span className="label text-ink-muted">Description</span>
          <textarea
            value={v.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="field-box mt-1.5 resize-none"
          />
        </label>
      </section>

      {error && <p className="border border-clay/40 bg-clay/5 px-5 py-4 text-sm text-clay">{error}</p>}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <button type="submit" disabled={submitting} className="btn-ink label px-10 py-4">
          {submitting ? "Saving…" : "Publish Product"}
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => void submit("DRAFT")}
          className="btn-outline label px-10 py-4"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => setV(BLANK)}
          className="label px-4 py-4 text-ink-muted hover:text-clay"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
