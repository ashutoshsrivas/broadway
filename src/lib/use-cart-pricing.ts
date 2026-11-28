"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import type { Repriced } from "@/lib/order";

const EMPTY: Repriced = { lines: [], subtotal: 0, shipping: 0, total: 0, hasIssues: false };

/**
 * Live prices for whatever is in the bag.
 *
 * The bag is restored from localStorage and may have been sitting there for
 * weeks. Rather than trust the prices it remembers, this asks the server for
 * current ones whenever the contents change — so the bag, the cart page and
 * the checkout summary all show what the order will actually cost.
 *
 * The answer is stored together with the bag it was fetched for, which makes
 * "still loading" a comparison rather than a second piece of state that has
 * to be flipped in the effect body and kept in step.
 */
export function useCartPricing(shippingMethod: string = "STANDARD"): {
  priced: Repriced | null;
  loading: boolean;
  stale: boolean;
  error: string | null;
} {
  const items = useCartStore((s) => s.items);
  const [result, setResult] = useState<{ key: string; data: Repriced } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keyed on the contents, not the array identity — zustand returns a new
  // array on every store write, which would otherwise refetch on any change.
  // The delivery choice is part of the key, because it changes the total the
  // server quotes — without it, switching to express would keep showing the
  // standard figure until something else in the bag moved.
  const key =
    items.map((i) => `${i.variantId}:${i.quantity}`).join("|") + `#${shippingMethod}`;
  const empty = items.length === 0;

  useEffect(() => {
    if (empty) return;

    const controller = new AbortController();

    fetch("/api/cart/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        shippingMethod,
      }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("price failed"))))
      .then((data: Repriced) => {
        setResult({ key, data });
        setError(null);
      })
      .catch(() => {
        // An aborted request is the normal path when the bag changes mid-flight.
        if (!controller.signal.aborted) setError("Could not refresh prices.");
      });

    return () => controller.abort();
    // `key` stands in for the contents and the delivery choice; `items` is a
    // fresh array on every store write and would refetch on any change at all.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, empty]);

  const fresh = result?.key === key;

  return {
    priced: empty ? EMPTY : (result?.data ?? null),
    loading: !empty && !fresh,
    // Showing the previous figures while new ones land, so the total does not
    // flash to nothing on every quantity change.
    stale: !empty && !fresh && result !== null,
    error,
  };
}
