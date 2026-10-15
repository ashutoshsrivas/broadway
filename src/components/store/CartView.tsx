"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice, discountPct } from "@/lib/utils";
import { shippingFor, FREE_SHIPPING_ABOVE } from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

export function CartView() {
  const { items, updateQuantity, removeItem } = useCartStore();
  // The bag comes out of localStorage, so nothing cart-shaped can be rendered
  // until the client has hydrated without causing a mismatch.
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-64" />;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-line" strokeWidth={1} />
        <p className="display mt-7 text-3xl">Your bag is empty</p>
        <p className="mt-3 max-w-sm text-sm text-ink-soft">
          Nothing chosen yet. The right frame is somewhere in the collection.
        </p>
        <Link href="/shop" className="btn-ink label mt-9 px-10 py-4">
          Browse Frames
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + Math.max(0, i.mrp - i.price) * i.quantity, 0);
  const shipping = shippingFor(subtotal);

  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
      <ul className="divide-y divide-line border-t border-line">
        {items.map((item) => {
          const save = discountPct(item.mrp, item.price);
          return (
            <li key={item.variantId} className="flex gap-5 py-6">
              <Link
                href={`/product/${item.slug}`}
                className="h-28 w-32 shrink-0 overflow-hidden bg-paper-sunk sm:h-32 sm:w-40"
              >
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {item.brand && <p className="label text-ink-muted">{item.brand}</p>}
                    <Link
                      href={`/product/${item.slug}`}
                      className="mt-1.5 block font-display text-lg leading-snug hover:text-brass"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-ink-muted">{item.colorName}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="shrink-0 p-1 text-ink-muted transition-colors hover:text-clay"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="p-2.5 text-ink-soft transition-colors hover:text-brass"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" strokeWidth={2} />
                    </button>
                    <span className="w-9 text-center text-sm tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="p-2.5 text-ink-soft transition-colors hover:text-brass disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className={`font-medium ${save > 0 ? "text-clay" : ""}`}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {save > 0 && (
                      <p className="text-xs text-ink-muted line-through">
                        {formatPrice(item.mrp * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summary */}
      <aside className="lg:sticky lg:top-[124px] lg:self-start">
        <div className="border border-line bg-paper-raised p-7">
          <h2 className="label-lg">Order Summary</h2>
          <hr className="rule-deco my-5" />

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-clay">
                <dt>You save</dt>
                <dd>−{formatPrice(savings)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping</dt>
              <dd>
                {shipping === 0 ? (
                  <span className="text-brass">Complimentary</span>
                ) : (
                  formatPrice(shipping)
                )}
              </dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="mt-4 border-t border-line pt-4 text-xs text-ink-muted">
              Add {formatPrice(FREE_SHIPPING_ABOVE - subtotal)} more for complimentary shipping.
            </p>
          )}

          <hr className="rule-deco my-5" />
          <div className="flex items-baseline justify-between">
            <span className="label">Total</span>
            <span className="font-display text-2xl">{formatPrice(subtotal + shipping)}</span>
          </div>

          <Link href="/checkout" className="btn-ink label mt-7 flex w-full justify-center py-4">
            Proceed to Checkout
          </Link>
          <Link href="/shop" className="label mt-4 block text-center text-ink-muted link-rule">
            Continue shopping
          </Link>
        </div>
      </aside>
    </div>
  );
}
