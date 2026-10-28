"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/lib/store";
import { formatPrice, discountPct } from "@/lib/utils";

export type SpotlightProduct = {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  price: number;
  brand: { name: string } | null;
  images: { url: string; alt: string | null }[];
  variants: { id: string; colorName: string; colorHex: string | null; stock: number; priceOverride: number | null }[];
};

/**
 * One frame, given the whole width — the shop's pick of the moment.
 *
 * Buying from here skips the product page entirely, so the two buttons do the
 * work a PDP normally would: add to bag, or go straight to checkout.
 */
export function MustHaveSpotlight({
  product,
  heading,
}: {
  product: SpotlightProduct;
  heading: string;
}) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setIsOpen);
  const [busy, setBusy] = useState(false);

  // Default to a colourway that can actually be bought, so the buttons are
  // never pointing at sold-out stock.
  const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const price = variant?.priceOverride ?? product.price;
  const save = discountPct(product.mrp, price);
  const inStock = (variant?.stock ?? 0) > 0;

  const add = () => {
    if (!variant || !inStock) return false;
    addItem({
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
    });
    return true;
  };

  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-24">
        <h2 className="label-lg text-center text-ink">{heading}</h2>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <Link
            href={`/product/${product.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden bg-paper"
          >
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0].url}
                alt={product.images[0].alt ?? product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
            )}
            {save > 0 && (
              <span className="label absolute left-4 top-4 bg-clay px-3 py-2 text-paper">
                Save {save}%
              </span>
            )}
          </Link>

          <div className="lg:max-w-md">
            <p className="label-lg text-ink-muted">{product.brand?.name ?? "Broadway"}</p>

            <h3 className="mt-5">
              <Link
                href={`/product/${product.slug}`}
                className="label text-[1.6rem] leading-tight tracking-[0.16em] transition-colors hover:text-brass"
              >
                {product.name}
              </Link>
            </h3>

            <p className="mt-6 flex items-baseline gap-3">
              <span className={`label text-xl ${save > 0 ? "text-clay" : "text-ink"}`}>
                {formatPrice(price)}
              </span>
              {save > 0 && (
                <span className="text-sm text-ink-muted line-through">{formatPrice(product.mrp)}</span>
              )}
            </p>

            <div className="mt-10 space-y-3">
              <button
                onClick={() => {
                  if (!add()) return;
                  toast.success("Added to your bag");
                  setCartOpen(true);
                }}
                disabled={!inStock}
                className="btn-outline label w-full py-4"
              >
                {inStock ? "Add to Cart" : "Sold Out"}
              </button>

              <button
                onClick={() => {
                  if (!add()) return;
                  setBusy(true);
                  router.push("/checkout");
                }}
                disabled={!inStock || busy}
                className="btn-ink label w-full py-4"
              >
                {busy ? "Taking you there…" : "Buy It Now"}
              </button>
            </div>

            <Link
              href={`/product/${product.slug}`}
              className="mt-7 inline-block border-b border-ink pb-0.5 text-sm text-ink-soft transition-colors hover:border-brass hover:text-brass"
            >
              View product details
            </Link>

            {inStock && variant.stock <= 3 && (
              <p className="label mt-5 text-clay">◆ Only {variant.stock} left</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
