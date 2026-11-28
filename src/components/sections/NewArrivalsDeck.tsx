"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductCardData } from "@/lib/catalog";

export type BrandDeck = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  products: ProductCardData[];
};

/** How the tabs are labelled. Set in the admin panel. */
export type TabStyle = "logo" | "name" | "both";

/** Milliseconds a card holds before the carousel advances. */
const STEP_MS = 2000;

/**
 * "New Arrivals", tabbed by brand.
 *
 * Each tab holds that house's most recent arrivals and scrolls on its own.
 * The track is a real scroll container with snap points rather than a
 * transformed strip, so a phone can swipe it natively and the keyboard and
 * scrollbar keep working — the timer just nudges the same scroll position the
 * finger would.
 */
export function NewArrivalsDeck({
  brands,
  newDays,
  tabStyle = "logo",
}: {
  brands: BrandDeck[];
  /** How long a frame stays on this rack, from the admin panel. */
  newDays?: number;
  tabStyle?: TabStyle;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);

  const deck = brands[active];
  const count = deck?.products.length ?? 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /** Scroll by exactly one card, wrapping to the start at the end. */
  const step = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;

    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;

    // Measured rather than assumed: how many cards are visible is decided by
    // CSS breakpoints, and the gap comes from the stylesheet too.
    const stride = card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0");
    const maxScroll = track.scrollWidth - track.clientWidth;

    // A 1px tolerance — sub-pixel layout means scrollLeft rarely lands exactly
    // on maxScroll, and without it the last card would never wrap.
    if (direction === 1 && track.scrollLeft >= maxScroll - 1) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    if (direction === -1 && track.scrollLeft <= 1) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
      return;
    }

    track.scrollBy({ left: stride * direction, behavior: "smooth" });
  }, []);

  // Autoscroll. Stops on hover, while the tab is hidden, and for anyone who
  // has asked for reduced motion — a deck that moves every two seconds is
  // exactly the thing that setting is for.
  useEffect(() => {
    if (reducedMotion || paused || count < 2) return;
    const timer = setInterval(() => step(1), STEP_MS);
    return () => clearInterval(timer);
  }, [reducedMotion, paused, count, step, active]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Switching brand rewinds the track; otherwise the new tab opens part-way
  // through, scrolled to wherever the previous one happened to be.
  const chooseBrand = (index: number) => {
    setActive(index);
    trackRef.current?.scrollTo({ left: 0, behavior: "auto" });
  };

  if (brands.length === 0 || !deck) return null;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="label text-brass">Just Arrived</p>
            <h2 className="display mt-3 text-[clamp(1.85rem,4vw,3rem)]">
              New on the <em>rack</em>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Previous"
              className="flex h-11 w-11 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => step(1)}
              aria-label="Next"
              className="flex h-11 w-11 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* ── Brand tabs ──
            The houses are shown by their own logo where one has been
            uploaded, because that is how a shopper recognises them — the
            name is the fallback, not the default.

            The tabs sit on paper rather than reversing to ink when active.
            A logo is artwork someone else owns: knocking it out to white so
            it reads on a dark tab works for a black wordmark and ruins a
            logo that is already light, and we cannot know which we have
            been given. Keeping every tab on the same light ground means the
            artwork is always shown as its owner drew it. */}
        <div
          role="tablist"
          aria-label="Brands"
          className="-mx-5 mt-9 flex gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0"
        >
          {brands.map((brand, i) => {
            const selected = i === active;
            const showLogo = tabStyle !== "name" && Boolean(brand.logoUrl);
            const showName = tabStyle === "name" || tabStyle === "both" || !brand.logoUrl;

            return (
              <button
                key={brand.id}
                role="tab"
                aria-selected={selected}
                // The logo carries no text, so the tab needs its own label.
                aria-label={brand.name}
                onClick={() => chooseBrand(i)}
                className={`group flex shrink-0 flex-col items-center justify-center gap-1.5 border bg-paper-raised px-5 py-3 transition-colors ${
                  selected
                    ? "border-ink"
                    : "border-line hover:border-ink-muted"
                }`}
              >
                {showLogo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl!}
                    alt=""
                    loading="lazy"
                    className={`h-6 w-auto max-w-[7rem] object-contain transition-all lg:h-7 ${
                      selected
                        ? "opacity-100"
                        : "opacity-45 grayscale group-hover:opacity-80 group-hover:grayscale-0"
                    }`}
                  />
                )}

                {showName && (
                  <span
                    className={`label whitespace-nowrap transition-colors ${
                      selected ? "text-ink" : "text-ink-muted group-hover:text-ink-soft"
                    }`}
                  >
                    {brand.name}
                  </span>
                )}

                <span
                  className={`label text-[0.5rem] transition-colors ${
                    selected ? "text-brass" : "text-ink-muted/70"
                  }`}
                >
                  {brand.products.length} new
                </span>

                {/* The brass rule is what marks the active house, now that
                    the tab itself no longer reverses. */}
                <span
                  aria-hidden="true"
                  className={`mt-0.5 h-px w-full transition-colors ${
                    selected ? "bg-brass" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ── Carousel ──
            One card on a phone, two from sm, three from lg. The widths are
            CSS, not JavaScript, so the first paint is already correct. */}
        <ul
          ref={trackRef}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 lg:mx-0 lg:gap-7 lg:px-0"
        >
          {deck.products.map((product, i) => (
            <li
              key={product.id}
              className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.5rem)/3)]"
            >
              <ProductCard product={product} priority={i < 3} newDays={newDays} />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link href={`/shop?brand=${deck.slug}&sort=newest`} className="label link-rule text-ink-soft">
            View all new {deck.name} →
          </Link>
        </div>
      </div>
    </section>
  );
}
