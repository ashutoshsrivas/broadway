"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Result = {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand: { name: string } | null;
  images: { url: string }[];
};

const SUGGESTIONS = ["Aviator", "Ray-Ban", "Blue-cut", "Cat eye", "Titanium", "Rimless"];

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  // Results are stored together with the term they belong to, so "still
  // loading" is derived (`answered !== term`) instead of being a second piece
  // of state that has to be flipped in the effect body and kept in sync.
  const [results, setResults] = useState<{ term: string; items: Result[] }>({
    term: "",
    items: [],
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const term = query.trim();
  const tooShort = term.length < 2;
  const loading = !tooShort && results.term !== term;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    // Lock the page behind the overlay so a scroll gesture doesn't move it.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Debounced so a fast typist fires one request, not eight. The AbortController
  // drops a slow earlier response that would otherwise land after a newer one.
  useEffect(() => {
    if (tooShort) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setResults({ term, items: data.products ?? [] });
      } catch {
        // An aborted request is the expected path while typing — not an error.
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, tooShort]);

  return (
    <div className="fixed inset-0 z-[70] animate-fade">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />

      <div className="relative mx-auto max-h-full w-full overflow-y-auto border-b border-line bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-8 md:py-12">
          <div className="flex items-center gap-4 border-b border-ink pb-3">
            <Search className="h-5 w-5 shrink-0 text-brass" strokeWidth={1.5} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search frames, brands, shapes…"
              className="w-full bg-transparent font-display text-2xl outline-none placeholder:text-ink-muted md:text-3xl"
            />
            <button onClick={onClose} aria-label="Close search" className="shrink-0 p-1">
              <X className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />
            </button>
          </div>

          {tooShort ? (
            <div className="mt-8">
              <p className="label mb-4 text-ink-muted">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="label border border-line px-4 py-2.5 text-ink-soft transition-colors hover:border-brass hover:text-brass"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : loading ? (
            <p className="label mt-10 text-center text-ink-muted">Searching…</p>
          ) : results.items.length === 0 ? (
            <p className="mt-10 text-center font-display text-lg text-ink-muted">
              Nothing matches “{query}”.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-line">
              {results.items.slice(0, 6).map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-5 py-4"
                  >
                    <div className="h-16 w-20 shrink-0 overflow-hidden bg-paper-sunk">
                      {product.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0].url}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {product.brand && <p className="label text-ink-muted">{product.brand.name}</p>}
                      <p className="mt-1 truncate font-display text-lg">{product.name}</p>
                    </div>
                    <span className="shrink-0 font-sans text-sm">{formatPrice(product.price)}</span>
                  </Link>
                </li>
              ))}
              <li className="pt-5">
                <Link
                  href={`/shop?q=${encodeURIComponent(term)}`}
                  onClick={onClose}
                  className="label text-brass link-rule"
                >
                  View all results →
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
