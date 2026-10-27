"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  posterUrl: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  align: "LEFT" | "CENTRE" | "RIGHT";
  overlay: number;
  durationMs: number;
};

const ALIGN = {
  LEFT: "items-start text-left",
  CENTRE: "items-center text-center",
  RIGHT: "items-end text-right",
} as const;

/**
 * Full-bleed hero carousel.
 *
 * Slides cross-fade rather than slide sideways, because the deck mixes stills
 * and video and a horizontal track makes a video jump as it is composited.
 *
 * The dots double as the clock: all the same height, with the active one
 * stretched into a bar that fills over exactly that slide's duration. That
 * gives the one thing a row of equal dots cannot — how long is left — without
 * adding a second piece of furniture to the design.
 */
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const count = slides.length;
  const current = slides[index];

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // Someone who has asked for less motion gets a still hero they can page
  // through by hand, not a deck that moves on its own.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // A carousel advancing in a background tab is wasted work, and on return it
  // would have skipped several slides at once.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // The advance timer. Keyed on index as well as duration, so every slide gets
  // its own full interval and the progress bar below stays in step with it.
  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = setTimeout(() => go(index + 1), current?.durationMs ?? 5000);
    return () => clearTimeout(timer);
  }, [index, count, paused, reducedMotion, current?.durationMs, go]);

  // Video plays only while its slide is up: a hidden <video> still decodes
  // frames, which on a phone is a meaningful chunk of battery.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index && !reducedMotion) {
        video.currentTime = 0;
        void video.play().catch(() => {
          // Autoplay can still be refused even when muted; the poster stands in.
        });
      } else {
        video.pause();
      }
    });
  }, [index, reducedMotion]);

  if (count === 0) return null;

  return (
    <section
      className="relative isolate h-[calc(100svh-var(--site-chrome))] min-h-[30rem] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <article
            key={slide.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {slide.mediaType === "VIDEO" ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={slide.mediaUrl}
                poster={slide.posterUrl ?? undefined}
                muted
                loop
                playsInline
                // Only the first slide is worth the bandwidth up front; the
                // rest load their poster and fetch the video when they come up.
                preload={i === 0 ? "auto" : "none"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.mediaUrl}
                alt={slide.heading ?? ""}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Two veils: a flat one set per slide for overall legibility, and
                a gradient weighted to the foot where the caption and dots sit. */}
            <div
              className="absolute inset-0 bg-ink"
              style={{ opacity: slide.overlay / 100 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />

            <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-center px-5 pb-28 lg:px-10">
              <div className={`flex max-w-2xl flex-col ${ALIGN[slide.align]} ${
                slide.align === "CENTRE" ? "mx-auto" : slide.align === "RIGHT" ? "ml-auto" : ""
              }`}>
                {slide.eyebrow && (
                  <p
                    key={`${slide.id}-eyebrow-${index}`}
                    className={`label-lg text-brass-soft ${active ? "animate-rise" : "opacity-0"}`}
                  >
                    {slide.eyebrow}
                  </p>
                )}

                {slide.heading && (
                  <h1
                    key={`${slide.id}-heading-${index}`}
                    className={`display mt-5 text-[clamp(2.5rem,7vw,5.5rem)] text-paper ${
                      active ? "animate-rise [animation-delay:120ms]" : "opacity-0"
                    }`}
                  >
                    {slide.heading}
                  </h1>
                )}

                {slide.subheading && (
                  <p
                    key={`${slide.id}-sub-${index}`}
                    className={`mt-6 max-w-lg text-[1.05rem] leading-relaxed text-paper/75 ${
                      active ? "animate-rise [animation-delay:220ms]" : "opacity-0"
                    }`}
                  >
                    {slide.subheading}
                  </p>
                )}

                {slide.ctaLabel && slide.ctaHref && (
                  <Link
                    key={`${slide.id}-cta-${index}`}
                    href={slide.ctaHref}
                    tabIndex={active ? 0 : -1}
                    className={`label mt-9 inline-block bg-paper px-10 py-4 text-ink transition-colors hover:bg-brass ${
                      active ? "animate-rise [animation-delay:320ms]" : "opacity-0"
                    }`}
                  >
                    {slide.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </article>
        );
      })}

      {/* ── Dots ── */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-10 pb-9 lg:pb-11">
          <div className="mx-auto flex max-w-[1500px] items-center gap-2.5 px-5 lg:px-10">
            {slides.map((slide, i) => {
              const active = i === index;
              return (
                <button
                  key={slide.id}
                  onClick={() => go(i)}
                  aria-label={`Slide ${i + 1} of ${count}${slide.heading ? `: ${slide.heading}` : ""}`}
                  aria-current={active}
                  // Same height throughout; the active one stretches into the
                  // progress bar. Height stays generous enough to tap.
                  className="group relative h-6 shrink-0 py-2.5"
                  style={{ width: active ? "3.5rem" : "0.75rem" }}
                >
                  <span
                    className={`block h-1 w-full overflow-hidden rounded-full transition-colors ${
                      active ? "bg-paper/30" : "bg-paper/35 group-hover:bg-paper/60"
                    }`}
                  >
                    {active && (
                      <span
                        // Re-keyed on the index so the fill restarts from zero
                        // on every slide, including a manual jump back to one
                        // already shown.
                        key={`fill-${index}`}
                        className="block h-full rounded-full bg-paper"
                        style={{
                          animation: reducedMotion
                            ? "none"
                            : `hero-progress ${slide.durationMs}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                          width: reducedMotion ? "100%" : undefined,
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
