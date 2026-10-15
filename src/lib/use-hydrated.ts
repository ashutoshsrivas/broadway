"use client";

import { useSyncExternalStore } from "react";

// Nothing to subscribe to: the answer flips once, at hydration, and React
// re-renders then anyway.
const noopSubscribe = () => () => {};

/**
 * `false` on the server and during the first client render, `true` afterwards.
 *
 * Anything read from localStorage — the cart, chiefly — must not be painted
 * until this is true, or the server's empty bag and the client's restored one
 * disagree and React throws a hydration mismatch.
 *
 * `useSyncExternalStore` is the sanctioned way to ask this: a `useState` +
 * `useEffect(() => setMounted(true))` pair does the same job by triggering a
 * cascading render, which is what the react-hooks rules now (rightly) flag.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,  // client
    () => false  // server
  );
}
