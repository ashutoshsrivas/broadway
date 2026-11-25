"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

export type LookbookSlide = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  posterUrl: string | null;
  kicker: string | null;
  heading: string | null;
  indexLabel: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  overlay: number;
  durationMs: number;
};

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/** Roman for the counter, falling back to the plain number past twelve. */
function roman(n: number): string {
  return NUMERALS[n - 1] ?? String(n);
}

/**
 * The lookbook hero.
 *
 * One house at a time: its initial standing behind the copy as a watermark,
 * the city it comes from, the name, a line about it, and the plate alongside.
 * The index down the right is both a contents page and the clock — the rule
 * under the active house fills over exactly that slide's duration, so there
 * is no second progress bar competing with it.
 *
 * Every moving part is CSS keyframed and re-keyed on the slide index, so a
 * change of slide costs one React render and the browser does the rest off
 * the main thread. That matters here more than anywhere: this is the first
 * paint on a phone.
 */
export function HeroLookbook({
  slides,
  eyebrow,
}: {
  slides: LookbookSlide[];
  eyebrow?: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const count = slides.length;
  const current = slides[index];
  const nextSlide = slides[(index + 1) % count];
  const duration = current?.durationMs ?? 6000;

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // A deck advancing in a background tab is wasted work, and on return it
  // would have skipped several houses at once.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion) return;
    const timer = setTimeout(() => go(index + 1), duration);
    return () => clearTimeout(timer);
  }, [index, count, paused, reducedMotion, duration, go]);

  // A hidden <video> still decodes frames, which on a phone is real battery.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {
      // Autoplay can be refused even when muted; the poster stands in.
    });
  }, [index, reducedMotion]);

  if (count === 0 || !current) return null;

  const name = current.heading ?? "";
  const mark = name.trim().charAt(0).toUpperCase();
  const poster = current.posterUrl ?? current.mediaUrl;

  return (
    <section
      className={`relative isolate flex w-full flex-col overflow-hidden bg-ink text-paper ${
        paused ? "lookbook-paused" : ""
      } min-h-[calc(100svh-var(--marquee-h,0px))] lg:block lg:min-h-0`}
      style={{ ["--slide-ms" as string]: `${duration}ms` }}
      aria-roledescription="carousel"
      aria-label="The lookbook"
    >
      {/* ── The plate, as a phone sees it ──
          A phone has no room for a picture beside the words, so the picture
          is behind them and the words sit on it. Rendered separately from the
          desktop plate rather than repositioned, because the two are
          genuinely different compositions; the browser fetches the one image
          once whichever is showing. */}
      <div
        key={`bg-${current.id}`}
        className="lookbook-plate absolute inset-0 z-0 lg:hidden"
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt=""
          fetchPriority={index === 0 ? "high" : "auto"}
          className="lookbook-plate-media h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink" style={{ opacity: current.overlay / 100 }} />
        {/* Enough ground under the words to read them on any photograph. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/20" />
        <span
          className="lookbook-edge pointer-events-none absolute inset-y-0 left-0 w-px bg-brass-soft"
        />
      </div>

      {/* The next house, far right, very dim — the page is always showing you
          that there is more. Desktop only: on a phone it would only mud the
          photograph the words have to sit on. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[26%] opacity-[0.14] lg:block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`peek-${nextSlide.id}`}
          src={nextSlide.posterUrl ?? nextSlide.mediaUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover grayscale"
        />
        {/* Heavy enough that the index column stays the thing you read, not
            the photograph behind it. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
      </div>

      {/* The band sits under the transparent header, so its own content
          starts below the header's measured height. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-end gap-0 px-5 pb-6 pt-[calc(var(--header-h,5rem)+1.5rem)] lg:grid lg:grid-cols-[1.05fr_0.95fr_auto] lg:items-center lg:gap-12 lg:px-10 lg:pb-16 lg:pt-[calc(var(--header-h,7rem)+3rem)]">
        {/* ── Copy ── */}
        <div className="relative order-2 min-w-0 lg:order-1">
          {/* The house's initial, set enormous behind the words. */}
          <span
            key={`mark-${current.id}`}
            aria-hidden="true"
            className="lookbook-mark pointer-events-none absolute -left-4 -top-20 select-none font-display leading-none text-paper lg:-left-10 lg:-top-24"
            style={{ fontSize: "clamp(10rem, 26vw, 24rem)" }}
          >
            {mark}
          </span>

          <div className="relative">
            {eyebrow && (
              <p className="label text-[0.55rem] text-paper/45 lg:text-[0.6rem]">{eyebrow}</p>
            )}

            {current.kicker && (
              <div className="lookbook-line mt-5 overflow-hidden lg:mt-9">
                <p
                  key={`kicker-${current.id}`}
                  className="label text-brass-soft"
                  style={{ ["--rise-delay" as string]: "120ms" }}
                >
                  {current.kicker}
                </p>
              </div>
            )}

            {name && (
              <div className="lookbook-line mt-2.5 overflow-hidden pb-1 lg:mt-3">
                <h1
                  key={`name-${current.id}`}
                  className="display text-[clamp(2.1rem,9vw,4.6rem)] leading-[1.02]"
                  style={{ ["--rise-delay" as string]: "200ms" }}
                >
                  {name}
                </h1>
              </div>
            )}

            {current.subheading && (
              <div className="lookbook-line mt-3 overflow-hidden pb-1 lg:mt-5">
                <p
                  key={`sub-${current.id}`}
                  className="max-w-md font-display text-[clamp(1.05rem,4.5vw,1.6rem)] italic leading-snug text-paper/75"
                  style={{ ["--rise-delay" as string]: "300ms" }}
                >
                  {current.subheading}
                </p>
              </div>
            )}

            {current.ctaLabel && current.ctaHref && (
              <div className="lookbook-line mt-6 overflow-hidden pb-1 lg:mt-10">
                <span
                  key={`cta-${current.id}`}
                  style={{ ["--rise-delay" as string]: "400ms" }}
                >
                  <Link
                    href={current.ctaHref}
                    className="label group inline-flex items-center gap-4 text-paper"
                  >
                    {current.ctaLabel}
                    {/* The rule grows on hover — the one piece of motion the
                        shopper controls. */}
                    <span className="h-px w-12 origin-left bg-brass transition-transform duration-500 group-hover:scale-x-150" />
                  </Link>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── The plate, as a desktop sees it ── */}
        <div className="relative order-1 hidden lg:order-2 lg:block">
          <div
            key={`plate-${current.id}`}
            className="lookbook-plate relative aspect-[4/5] w-full overflow-hidden bg-ink/40"
          >
            {current.mediaType === "VIDEO" ? (
              <video
                ref={videoRef}
                key={`video-${current.id}`}
                src={current.mediaUrl}
                poster={poster}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                className="lookbook-plate-media h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`img-${current.id}`}
                src={current.mediaUrl}
                alt={name}
                className="lookbook-plate-media h-full w-full object-cover"
              />
            )}

            <div
              className="absolute inset-0 bg-ink"
              style={{ opacity: current.overlay / 100 }}
            />

            {/* The brass edge that rides ahead of the shutter. */}
            <span
              key={`edge-${current.id}`}
              aria-hidden="true"
              className="lookbook-edge pointer-events-none absolute inset-y-0 left-0 w-px bg-brass-soft"
            />
          </div>

          {/* A rule set off the plate's corner, so the picture reads as
              mounted rather than dropped in. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 border-b border-r border-brass/40"
          />
        </div>

        {/* ── The index ── */}
        <nav
          aria-label="Houses in this lookbook"
          className="order-3 mt-7 min-w-0 lg:mt-0 lg:w-48"
        >
          {/* A phone gets a scrolling row; a desktop gets the column. The
              min-w-0 above is what keeps that row from widening the whole
              band past the screen. */}
          <ul className="flex gap-5 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
            {slides.map((slide, i) => {
              const active = i === index;
              return (
                <li key={slide.id} className="shrink-0 lg:w-full">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={active ? "true" : undefined}
                    className="group relative block w-full py-2 text-left lg:py-2.5"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className={`label text-[0.55rem] italic transition-colors ${
                          active ? "text-brass" : "text-paper/35 group-hover:text-paper/60"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`whitespace-nowrap font-display text-sm transition-colors lg:text-[0.95rem] ${
                          active ? "text-paper" : "text-paper/45 group-hover:text-paper/75"
                        }`}
                      >
                        {slide.indexLabel ?? slide.heading ?? `Slide ${i + 1}`}
                      </span>
                    </span>

                    {/* The rule under the active house is the clock. */}
                    <span className="absolute inset-x-0 bottom-0 h-px bg-paper/15">
                      {active && (
                        <span
                          key={`fill-${slide.id}-${index}`}
                          className="lookbook-index-fill block h-full bg-brass"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* ── Controls and counter ── */}
      {/* What is coming, set sideways against the right edge. */}
      {count > 1 && (
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label={`Next — ${nextSlide.indexLabel ?? nextSlide.heading ?? ""}`}
          className="label absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-3 px-2 py-6 text-[0.5rem] text-paper/40 transition-colors hover:text-brass lg:flex"
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="h-10 w-px bg-paper/25" />
          Next · {nextSlide.indexLabel ?? nextSlide.heading}
        </button>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] items-center justify-between gap-6 px-5 pb-8 lg:px-10 lg:pb-12">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous house"
            className="p-2.5 text-paper/50 transition-colors hover:text-paper"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
            className="flex h-9 w-9 items-center justify-center border border-paper/25 text-paper/70 transition-colors hover:border-brass hover:text-brass"
          >
            {paused ? (
              <Play className="h-3 w-3" strokeWidth={1.5} />
            ) : (
              <Pause className="h-3 w-3" strokeWidth={1.5} />
            )}
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next house"
            className="p-2.5 text-paper/50 transition-colors hover:text-paper"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <p className="flex items-baseline gap-2 font-display" aria-live="polite">
          <span className="text-2xl text-paper lg:text-3xl">{roman(index + 1)}</span>
          <span className="label text-[0.55rem] text-paper/40">/ {roman(count)}</span>
        </p>
      </div>
    </section>
  );
}
