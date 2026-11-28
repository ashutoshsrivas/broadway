"use client";

import { useEffect, useRef } from "react";

/**
 * The route the glasses travel. One path string, used three times: as the
 * drawn line, as the motion path the spectacles ride, and to measure its own
 * length so the dash animation knows how far to retract.
 *
 * The viewBox is 1000×220 and every coordinate below is in that space, so
 * the whole thing scales with the section and needs no measuring at runtime.
 */
const ROUTE = "M 60 150 C 230 40, 360 230, 520 120 S 800 20, 940 92";

/** Where the glasses are, as a fraction, for the two milestone labels. */
const START = { x: 60, y: 150 };
const END = { x: 940, y: 92 };

/**
 * Spectacles carried from the shop to a front door, as the reader scrolls.
 *
 * The movement is tied to the scroll position rather than to a clock, so the
 * glasses travel back if the page is scrolled back up. That is the whole
 * reason to do it this way instead of playing a canned animation when the
 * band appears — the reader is the one delivering them.
 *
 * The path length is measured once and published as a custom property, so
 * the dash animation works whatever the route is changed to later; hard-coding
 * a length is the usual way this breaks the first time someone edits the curve.
 */
export function DeliveryJourney() {
  const routeRef = useRef<SVGPathElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");

    const route = routeRef.current;
    const host = hostRef.current;
    if (route && host) {
      host.style.setProperty("--route-length", String(Math.ceil(route.getTotalLength())));
    }
    if (!host) return;

    // Only needed where scroll timelines are unsupported — the CSS keys the
    // fallback animation off this class.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
        <p className="label text-center text-brass">From the Mall to your door</p>
        <h2 className="display mx-auto mt-4 max-w-2xl text-center text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.1]">
          The frames make the journey, so you don&rsquo;t.
        </h2>

        <div
          ref={hostRef}
          className="journey relative mt-14"
          style={{ ["--route-path" as string]: `path("${ROUTE}")` }}
        >
          <svg
            viewBox="0 0 1000 220"
            className="w-full overflow-visible"
            role="img"
            aria-label="A pair of spectacles travelling from the Broadway store to a front door"
          >
            {/* The route, faint, as the ground it will be drawn over. */}
            <path
              d={ROUTE}
              fill="none"
              stroke="var(--color-line)"
              strokeWidth="2"
              strokeDasharray="1 10"
              strokeLinecap="round"
            />

            {/* The same route, drawn by the scroll. */}
            <path
              ref={routeRef}
              d={ROUTE}
              fill="none"
              stroke="var(--color-brass)"
              strokeWidth="2"
              strokeLinecap="round"
              className="journey-route"
            />

            {/* The shop it leaves from. */}
            <g transform={`translate(${START.x - 26} ${START.y - 26})`}>
              <circle cx="26" cy="26" r="25" fill="var(--color-paper-raised)" stroke="var(--color-line)" />
              <path
                d="M14 22 L26 14 L38 22 V38 H14 Z"
                fill="none"
                stroke="var(--color-ink-soft)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M22 38 V29 h8 v9" fill="none" stroke="var(--color-ink-soft)" strokeWidth="1.6" />
            </g>

            {/* The door it arrives at. */}
            <g
              transform={`translate(${END.x - 26} ${END.y - 26})`}
              className="journey-door"
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            >
              <circle cx="26" cy="26" r="25" fill="var(--color-brass)" />
              <path
                d="M13 24 L26 13 L39 24"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M17 24 V39 h18 V24" fill="none" stroke="var(--color-ink)" strokeWidth="1.8" />
              <path d="M24 39 v-7 h4 v7" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />
            </g>

            {/* The spectacles, riding the route. */}
            <g className="journey-rider">
              <g transform="translate(-26 -13)">
                <circle cx="13" cy="13" r="11.5" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
                <circle cx="39" cy="13" r="11.5" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth="2" />
                <path d="M24.5 13 h3" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
                <path d="M1.5 10 L-6 6" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
                <path d="M50.5 10 L58 6" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" />
              </g>
            </g>
          </svg>

          <div className="mt-6 flex items-start justify-between gap-6">
            <p className="label max-w-[8rem] text-[0.55rem] leading-relaxed text-ink-muted">
              The shop
              <span className="mt-1 block text-ink-soft">The Mall, Mussoorie</span>
            </p>
            <p className="label max-w-[8rem] text-right text-[0.55rem] leading-relaxed text-ink-muted">
              Your door
              <span className="mt-1 block text-ink-soft">Fitted, and left with you</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
