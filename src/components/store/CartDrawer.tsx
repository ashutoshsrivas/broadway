"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_ABOVE, shippingFor } from "@/lib/shipping";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const toFreeShipping = Math.max(0, FREE_SHIPPING_ABOVE - subtotal);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-ink/45 animate-fade" onClick={() => setIsOpen(false)} />

      <aside
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper animate-slide-left"
        aria-label="Shopping bag"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="label-lg">
            Your Bag {items.length > 0 && <span className="text-brass">({items.length})</span>}
          </h2>
          <button onClick={() => setIsOpen(false)} aria-label="Close bag" className="p-1">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-10 w-10 text-line" strokeWidth={1} />
            <p className="display mt-6 text-2xl">Your bag is empty</p>
            <p className="mt-2 text-sm text-ink-muted">
              Every great look starts with the right frame.
            </p>
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="btn-ink label mt-8 px-9 py-3.5"
            >
              Browse Frames
            </Link>
          </div>
        ) : (
          <>
            {/* Progress toward free shipping — a live nudge, not a static banner. */}
            <div className="border-b border-line bg-paper-sunk px-6 py-3.5">
              {toFreeShipping > 0 ? (
                <>
                  <p className="text-xs text-ink-soft">
                    Add <strong className="text-brass">{formatPrice(toFreeShipping)}</strong> more
                    for complimentary shipping
                  </p>
                  <div className="mt-2 h-px w-full bg-line">
                    <div
                      className="h-px bg-brass transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_ABOVE) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="label text-brass">◆ Complimentary shipping unlocked</p>
              )}
            </div>

            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="h-24 w-24 shrink-0 overflow-hidden bg-paper-sunk"
                  >
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    {item.brand && <p className="label text-ink-muted">{item.brand}</p>}
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="mt-1 font-display text-base leading-snug hover:text-brass"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-ink-muted">{item.colorName}</p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-2 text-ink-soft transition-colors hover:text-brass"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" strokeWidth={2} />
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-ink-soft transition-colors hover:text-brass disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" strokeWidth={2} />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="self-start p-1 text-ink-muted transition-colors hover:text-clay"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd>{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Shipping</dt>
                  <dd>{shipping === 0 ? <span className="text-brass">Complimentary</span> : formatPrice(shipping)}</dd>
                </div>
                <hr className="rule-deco !my-3" />
                <div className="flex justify-between font-display text-xl">
                  <dt>Total</dt>
                  <dd>{formatPrice(subtotal + shipping)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={() => setIsOpen(false)}
                className="btn-ink label mt-5 flex w-full items-center justify-center py-4"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="label mt-3 block text-center text-ink-muted link-rule"
              >
                View full bag
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
