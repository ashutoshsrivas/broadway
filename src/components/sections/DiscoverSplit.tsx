"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export type Panel = {
  id: string;
  eyebrow: string | null;
  heading: string;
  mediaUrl: string | null;
  posterUrl: string;
  href: string;
  overlay: number;
  backdropHex?: string | null;
  /** Set on the stand-in panels, so the page says so rather than implying it. */
  placeholder?: boolean;
};

/**
 * What the band shows before the shop has uploaded its own photographs: one
 * panel for him, one for her, both plainly marked. Better than an absent
 * section, which reads as a page that has lost a piece.
 */
export const PLACEHOLDER_PANELS: Panel[] = [
  {
    id: "placeholder-him",
    eyebrow: "For Him",
    heading: "Shop men's frames",
    mediaUrl: null,
    posterUrl: "",
    href: "/shop?gender=Men",
    overlay: 0,
    backdropHex: "#1F3A2E",
    placeholder: true,
  },
  {
    id: "placeholder-her",
    eyebrow: "For Her",
    heading: "Shop women's frames",
    mediaUrl: null,
    posterUrl: "",
    href: "/shop?gender=Women",
    overlay: 0,
    backdropHex: "#9C4A2F",
    placeholder: true,
  },
];

/**
 * The split "Discover" band — two (or more) full-height panels, each a link
 * into its part of the shop.
 */
export function DiscoverSplit({ panels }: { panels: Panel[] }) {
  // An empty band is a hole in the page, so the stand-ins run until the shop
  // uploads its own two photographs.
  const shown = panels.length > 0 ? panels : PLACEHOLDER_PANELS;

  return (
    <section className="border-b border-line">
      <h2 className="sr-only">Discover</h2>
      {/* Stacked on a phone, side by side from md. The panels share one grid
          so both halves are exactly the same height whatever the copy. */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {shown.map((panel) => (
          <DiscoverPane key={panel.id} panel={panel} />
        ))}
      </div>
    </section>
  );
}

function DiscoverPane({ panel }: { panel: Panel }) {
  // The poster carries the panel until the video can actually paint a frame.
  // `poster` alone would do it, but keeping our own <img> underneath means a
  // video that fails outright still leaves a finished-looking panel rather
  // than a black rectangle.
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <Link
      href={panel.href}
      // The backdrop is what shows through a cut-out portrait, and what
      // carries the panel entirely while the photograph is still a
      // placeholder.
      style={panel.backdropHex ? { backgroundColor: panel.backdropHex } : undefined}
      className="group relative block h-[62svh] min-h-[26rem] overflow-hidden bg-paper-sunk md:h-[78svh]"
      onMouseEnter={() => {
        // Only nudge playback on hover for a video that has stalled; an
        // already-playing loop is left alone.
        void videoRef.current?.play().catch(() => {});
      }}
    >
      {panel.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={panel.posterUrl}
          alt=""
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105 ${
            videoReady ? "opacity-0" : "opacity-100"
          }`}
        />
      ) : (
        <span className="label absolute inset-x-0 top-1/2 -translate-y-1/2 px-8 text-center text-[0.6rem] leading-relaxed text-paper/60">
          Placeholder — upload this photograph under Discover Panels
        </span>
      )}

      {panel.mediaUrl && (
        <video
          ref={videoRef}
          src={panel.mediaUrl}
          poster={panel.posterUrl}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          // `canplay` rather than `loadeddata`: the first frame can be decoded
          // well before there is enough buffered to run without stalling, and
          // fading in early produces a visible hitch.
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      <div className="absolute inset-0 bg-ink" style={{ opacity: panel.overlay / 100 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />

      {/* Hairline between the halves, so the split reads as deliberate rather
          than as two images that happen to touch. */}
      <span className="pointer-events-none absolute inset-y-0 right-0 hidden w-px bg-paper/15 md:block" />

      <div className="relative flex h-full flex-col justify-end p-8 lg:p-12">
        {panel.eyebrow && <p className="label-lg text-brass-soft">{panel.eyebrow}</p>}

        <p className="display mt-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] text-paper">
          {panel.heading}
        </p>

        <span className="label mt-6 inline-flex items-center gap-2.5 text-paper">
          Discover
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 transition-colors group-hover:border-brass group-hover:bg-brass group-hover:text-ink">
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              strokeWidth={1.5}
            />
          </span>
        </span>
      </div>
    </Link>
  );
}
