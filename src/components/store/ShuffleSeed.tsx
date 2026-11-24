"use client";

import { useEffect } from "react";

/**
 * Gives this visit a shuffle seed.
 *
 * A session cookie, written once: the shop grid mixes brands differently for
 * each visit, but stays put while the shopper pages through it. A server
 * component cannot set a cookie, and a whole middleware for one integer
 * would be a heavier moving part than this.
 */
export function ShuffleSeed() {
  useEffect(() => {
    if (document.cookie.includes("bw_shuffle=")) return;
    const seed = Math.floor(Math.random() * 2_000_000_000) + 1;
    // No max-age, so it dies with the browser session — which is exactly
    // what "each visit" means here.
    document.cookie = `bw_shuffle=${seed}; path=/; SameSite=Lax`;
  }, []);

  return null;
}
