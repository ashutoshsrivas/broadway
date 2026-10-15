"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Minus, Plus, ShoppingBag, Check, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, discountPct, titleCase } from "@/lib/utils";

type Variant = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string | null;
  priceOverride: number | null;
  stock: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mrp: number;
  price: number;
  gender: string;
  frameShape: string | null;
  frameMaterial: string | null;
  frameType: string | null;
  frameWidthMm: number | null;
  lensType: string | null;
  brand: { name: string } | null;
  category: { name: string };
  images: { url: string; alt: string | null }[];
  variants: Variant[];
};

export function ProductDetail({ product }: { product: Product }) {
  // Open on the first colourway that can actually be bought, so the default
  // view isn't a sold-out one.
  const [variant, setVariant] = useState<Variant>(
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setIsOpen);

  const price = variant?.priceOverride ?? product.price;
  const save = discountPct(product.mrp, price);
  const inStock = (variant?.stock ?? 0) > 0;

  const specs = [
    ["Frame shape", product.frameShape && titleCase(product.frameShape)],
    ["Rim", product.frameType && titleCase(product.frameType)],
    ["Material", product.frameMaterial && (product.frameMaterial === "TR90" ? "TR90" : titleCase(product.frameMaterial))],
    ["Frame width", product.frameWidthMm && `${product.frameWidthMm} mm`],
    ["Lens", product.lensType],
    ["Best for", titleCase(product.gender)],
    ["Colour", variant?.colorName],
    ["SKU", variant?.sku],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  const handleAdd = () => {
    if (!variant || !inStock) return;
    addItem(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name ?? null,
        colorName: variant.colorName,
        price,
        mrp: product.mrp,
        imageUrl: product.images[0]?.url ?? null,
        stock: variant.stock,
      },
      quantity
    );
    toast.success("Added to your bag");
    setCartOpen(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* ── Gallery ── */}
      <div className="lg:sticky lg:top-[124px] lg:self-start">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-sunk">
          {product.images[activeImage] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[activeImage].url}
              alt={product.images[activeImage].alt ?? product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="label text-ink-muted">Broadway Opticals</span>
            </div>
          )}

          {save > 0 && (
            <span className="label absolute left-4 top-4 bg-clay px-3 py-2 text-paper">
              Save {save}%
            </span>
          )}
        </div>

        {product.images.length > 1 && (
          <ul className="mt-3 grid grid-cols-5 gap-3">
            {product.images.map((image, i) => (
              <li key={image.url}>
                <button
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`block aspect-square w-full overflow-hidden border bg-paper-sunk transition-colors ${
                    i === activeImage ? "border-brass" : "border-transparent hover:border-line"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Purchase column ── */}
      <div>
        <p className="label text-brass">{product.brand?.name ?? "Broadway"}</p>
        <h1 className="display mt-3 text-[clamp(1.9rem,4.5vw,3rem)]">{product.name}</h1>
        <p className="label mt-3 text-ink-muted">{product.category.name}</p>

        <div className="mt-6 flex items-baseline gap-3">
          <span className={`font-display text-3xl ${save > 0 ? "text-clay" : ""}`}>
            {formatPrice(price)}
          </span>
          {save > 0 && (
            <span className="text-base text-ink-muted line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-ink-muted">Inclusive of all taxes</p>

        <hr className="rule-deco my-8" />

        {/* Colour picker */}
        {product.variants.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between">
              <p className="label">Colour</p>
              <p className="text-sm text-ink-soft">{variant?.colorName}</p>
            </div>

            <ul className="mt-4 flex flex-wrap gap-2.5">
              {product.variants.map((option) => {
                const selected = option.id === variant?.id;
                const soldOut = option.stock === 0;
                return (
                  <li key={option.id}>
                    <button
                      onClick={() => {
                        setVariant(option);
                        setQuantity(1);
                      }}
                      title={soldOut ? `${option.colorName} — sold out` : option.colorName}
                      aria-pressed={selected}
                      className={`relative flex h-11 w-11 items-center justify-center border transition-colors ${
                        selected ? "border-ink" : "border-line hover:border-ink-muted"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-line/60"
                        style={{ backgroundColor: option.colorHex ?? "#DED4C2" }}
                      />
                      {selected && (
                        <Check
                          className="absolute h-3.5 w-3.5 text-paper mix-blend-difference"
                          strokeWidth={3}
                        />
                      )}
                      {soldOut && (
                        <span className="absolute inset-0 flex items-center justify-center bg-paper/70 text-[9px] leading-none text-ink-muted">
                          ✕
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Quantity + add */}
        <div className="mt-8 flex flex-wrap items-stretch gap-3">
          <div className="flex items-center border border-line">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-4 text-ink-soft transition-colors hover:text-brass"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(variant?.stock ?? 1, q + 1))}
              disabled={quantity >= (variant?.stock ?? 0)}
              className="px-4 py-4 text-ink-soft transition-colors hover:text-brass disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="btn-ink label flex flex-1 items-center justify-center gap-2.5 px-8 py-4"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {inStock ? "Add to Bag" : "Sold Out"}
          </button>
        </div>

        {inStock && variant.stock <= 3 && (
          <p className="label mt-4 text-clay">
            ◆ Only {variant.stock} left in {variant.colorName}
          </p>
        )}

        {/* Reassurance */}
        <ul className="mt-9 space-y-3.5 border-t border-line pt-7">
          {[
            { icon: Truck, text: "Complimentary shipping on orders above ₹2,000" },
            { icon: ShieldCheck, text: "100% authentic, with full brand warranty" },
            { icon: RefreshCw, text: "14-day returns on unworn frames" },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-ink-soft">
              <Icon className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
              {text}
            </li>
          ))}
        </ul>

        {product.description && (
          <div className="mt-9 border-t border-line pt-7">
            <h2 className="label">The Details</h2>
            <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">
              {product.description}
            </p>
          </div>
        )}

        <div className="mt-9 border-t border-line pt-7">
          <h2 className="label">Specification</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6">
            {specs.map(([term, value]) => (
              <div key={term} className="flex justify-between border-b border-line/60 py-2.5 text-sm">
                <dt className="text-ink-muted">{term}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
