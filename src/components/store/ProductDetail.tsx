"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Check, MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, discountPct, titleCase } from "@/lib/utils";
import { brandEnquiryLink } from "@/lib/whatsapp";
import { Collapsible } from "@/components/store/Collapsible";
import type { ProductBlock } from "@/lib/product-copy";

/** The two ways a frame leaves the shop. Recorded, not priced — the lens is
    quoted once an optician has seen the prescription. */
const LENS_OPTIONS = [
  { value: "With prescription", note: "We'll call to take your prescription and quote the lenses." },
  { value: "Glasses only", note: "The frame as shown, with its demo lenses." },
] as const;

type Variant = {
  id: string;
  sku: string;
  colorName: string;
  colorCode: string | null;
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
  shape: string | null;
  material: string | null;
  size: string | null;
  countryOfOrigin: string | null;
  frameType: string | null;
  lensType: string | null;
  isLimitedEdition: boolean;
  isBoExclusive: boolean;
  category: { name: string; gstPercent?: number | null; isBoExclusive?: boolean | null };
  brand: { name: string; slug?: string; description?: string | null; isStoreExclusive?: boolean | null } | null;
  images: { url: string; alt: string | null }[];
  variants: Variant[];
};

export function ProductDetail({
  product,
  whatsappNumber,
  blocks,
  assistHeading,
  assistNote,
}: {
  product: Product;
  whatsappNumber?: string | null;
  /** Authenticity, warranty, shipping, after-sales — written in the admin. */
  blocks: ProductBlock[];
  assistHeading?: string | null;
  assistNote?: string | null;
}) {
  // A store-exclusive house is browsable but not priced online — buying it
  // goes through WhatsApp rather than the bag.
  const priceHidden = Boolean(product.brand?.isStoreExclusive);
  // Open on the first colourway that can actually be bought, so the default
  // view isn't a sold-out one.
  const [variant, setVariant] = useState<Variant>(
    product.variants.find((v) => v.stock > 0) ?? product.variants[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [lensOption, setLensOption] = useState<string>(LENS_OPTIONS[0].value);
  // The phone bar appears once the real buy row has scrolled past. Driven by
  // an observer rather than a scroll handler so it costs nothing while the
  // button is on screen, which is most of the time.
  const buyRowRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    const node = buyRowRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only once the real button has gone *up* past the top of the screen.
        // "Not on screen" alone would show the bar before the shopper has
        // even reached the button, repeating the price they can already see.
        setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setIsOpen);

  const price = variant?.priceOverride ?? product.price;
  const save = priceHidden ? 0 : discountPct(product.mrp, price);
  const inStock = (variant?.stock ?? 0) > 0;

  const specs = [
    ["Frame shape", product.shape],
    ["Rim", product.frameType && titleCase(product.frameType)],
    ["Material", product.material],
    ["Size", product.size],
    ["Lens", product.lensType],
    ["Best for", product.gender],
    ["Country of origin", product.countryOfOrigin],
    ["Colour", variant?.colorName],
    ["Colour code", variant?.colorCode],
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
        lensOption,
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
        <div className="relative aspect-[4/5] overflow-hidden bg-paper-sunk">
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
        <div className="flex flex-wrap items-center gap-3">
          <p className="label text-brass">{product.brand?.name ?? "Broadway"}</p>
          {(product.isBoExclusive || product.category.isBoExclusive) && (
            <span className="label border border-brass bg-brass/15 px-2.5 py-1 text-[0.6rem] text-brass">
              ◆ BO Exclusive
            </span>
          )}
          {product.isLimitedEdition && (
            <span className="label border border-brass px-2.5 py-1 text-[0.6rem] text-brass">
              ◆ Limited Edition
            </span>
          )}
        </div>
        <h1 className="display mt-3 text-[clamp(1.9rem,4.5vw,3rem)]">{product.name}</h1>
        <p className="label mt-3 text-ink-muted">{product.category.name}</p>

        {priceHidden ? (
          <>
            <p className="display mt-6 text-2xl text-brass">Available in store</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              {product.brand?.name} is stocked at our counters only. Message us and we&rsquo;ll
              confirm the price, the colourways we have, and put one aside for you to try.
            </p>
          </>
        ) : (
          <>
            <div className="mt-6 flex items-baseline gap-3">
              <span className={`font-display text-3xl ${save > 0 ? "text-clay" : ""}`}>
                {formatPrice(price)}
              </span>
              {save > 0 && (
                <span className="text-base text-ink-muted line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
            <p className="mt-1.5 text-xs text-ink-muted">
              {product.category.gstPercent
                ? `MRP inclusive of ${product.category.gstPercent}% GST`
                : "Inclusive of all taxes"}
            </p>
          </>
        )}

        <hr className="rule-deco my-8" />

        {/* Colour picker */}
        {product.variants.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="label">Colour</p>
              <p className="text-right text-sm text-ink-soft">
                {variant?.colorName}
                {variant?.colorCode && (
                  <span className="label ml-2.5 text-[0.6rem] text-ink-muted">
                    {variant.colorCode}
                  </span>
                )}
              </p>
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

        {/* 2 — Need assistance. Before the buy row on purpose: the shop would
            rather talk to someone unsure about a ₹30,000 frame than lose
            them to a silent page. */}
        <div className="mt-8 border border-line bg-paper-raised p-5">
          <p className="label">{assistHeading?.trim() || "Need assistance?"}</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {assistNote?.trim() ||
              "An optician can tell you how this frame sits, what lenses suit it and whether we have it in another colour."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href={brandEnquiryLink(
                `${product.brand?.name ?? "Broadway"} ${product.name}`,
                whatsappNumber
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="label flex items-center gap-2 border border-ink px-5 py-3 transition-colors hover:bg-ink hover:text-paper"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              Chat with us
            </a>
            <Link
              href="/contact"
              className="label border border-line px-5 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              Get in touch
            </Link>
          </div>
        </div>

        {/* 3 — With prescription, or the frame on its own. */}
        {!priceHidden && (
          <fieldset className="mt-8">
            <legend className="label">How would you like it?</legend>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {LENS_OPTIONS.map((option) => {
                const selected = lensOption === option.value;
                return (
                  <label
                    key={option.value}
                    className={`cursor-pointer border p-4 transition-colors ${
                      selected ? "border-ink bg-paper-raised" : "border-line hover:border-ink-muted"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="lensOption"
                        value={option.value}
                        checked={selected}
                        onChange={() => setLensOption(option.value)}
                        className="h-3.5 w-3.5 accent-[#2A1F17]"
                      />
                      <span className="label">{option.value}</span>
                    </span>
                    <span className="mt-2 block text-xs leading-relaxed text-ink-muted">
                      {option.note}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div ref={buyRowRef}>
        {priceHidden ? (
          <a
            href={brandEnquiryLink(
              `${product.brand?.name ?? "Broadway"} ${product.name}`,
              whatsappNumber
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ink label mt-8 flex w-full items-center justify-center gap-2.5 py-4"
          >
            Enquire on WhatsApp
          </a>
        ) : (
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
        )}
        </div>

        {/* 4 — Everything else, folded away. Specifications open, because
            that is the one block a shopper came for. */}
        <div className="mt-10 border-t border-line">
          {(specs.length > 0 || product.description) && (
            <Collapsible title="Product Specifications" defaultOpen>
              {/* The description lives at the head of the specs rather than
                  in a row of its own, so the accordion is the six the shop
                  asked for and not seven. */}
              {product.description && (
                <p className="mb-6 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">
                  {product.description}
                </p>
              )}
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {specs.map(([term, value]) => (
                  <div
                    key={term}
                    className="flex justify-between gap-4 border-b border-line/60 py-2.5 text-sm"
                  >
                    <dt className="text-ink-muted">{term}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </Collapsible>
          )}

          {product.brand?.description && (
            <Collapsible title="About Brand">
              <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">
                {product.brand.description}
              </p>
              {product.brand.slug && (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="label link-rule mt-4 inline-block text-ink-soft"
                >
                  Visit {product.brand.name} →
                </Link>
              )}
            </Collapsible>
          )}

          {blocks.map((block) => (
            <Collapsible key={block.title} title={block.title}>
              <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">
                {block.body}
              </p>
            </Collapsible>
          ))}
        </div>
      </div>

      {/* The phone bar: name, price and the one button, kept in reach however
          far down the page the shopper has read. Hidden from `lg`, where the
          buy column is sticky already. */}
      {showBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-sm lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-display">{product.name}</p>
              <p className="mt-0.5 text-xs">
                {priceHidden ? (
                  <span className="text-brass">Price in store</span>
                ) : (
                  <>
                    <span className={save > 0 ? "text-clay" : "text-ink-soft"}>
                      {formatPrice(price)}
                    </span>
                    {save > 0 && (
                      <span className="ml-2 text-ink-muted line-through">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            {priceHidden ? (
              <a
                href={brandEnquiryLink(
                  `${product.brand?.name ?? "Broadway"} ${product.name}`,
                  whatsappNumber
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ink label shrink-0 px-6 py-3.5"
              >
                Enquire
              </a>
            ) : (
              <button
                onClick={handleAdd}
                disabled={!inStock}
                className="btn-ink label shrink-0 px-6 py-3.5"
              >
                {inStock ? "Add to Bag" : "Sold Out"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
