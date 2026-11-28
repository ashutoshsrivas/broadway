import Link from "next/link";

export type StripBrand = {
  id: string;
  name: string;
  slug: string;
  tileUrl: string;
};

/**
 * "Discover our luxury brands" — a continuous strip of brand tiles.
 *
 * The wrapper holds the run twice and is itself what slides, by exactly half
 * its width — which is one whole run, so the loop never lands mid-list. The
 * animation has to sit on the wrapper rather than on each run: on each run it
 * would slide half of *that run*, finish somewhere arbitrary and snap back.
 *
 * Spacing is a right margin on each tile rather than a flex gap between the
 * runs, for the same reason — a gap between the two copies makes the wrapper
 * wider than two runs and -50% stops half a gap short.
 *
 * Speed is seconds-per-tile and the duration is derived from the count, so
 * the strip moves at one pace whether the shop features four houses or forty.
 */
const SECONDS_PER_TILE = 2.2;

export function BrandStripScroll({ brands }: { brands: StripBrand[] }) {
  if (brands.length === 0) return null;

  // Below about six tiles the duplicated track is narrower than a wide screen
  // and the seam shows. Repeating the list until there is enough to cover it
  // costs nothing and removes the edge case.
  const minimumTiles = 8;
  const repeats = Math.max(1, Math.ceil(minimumTiles / brands.length));
  const run = Array.from({ length: repeats }, () => brands).flat();

  return (
    <section className="marquee-host overflow-hidden border-b border-line bg-paper py-14 lg:py-16">
      <h2 className="label-lg mb-9 text-center text-ink-soft">Discover Our Luxury Brands</h2>

      <div
        className="flex w-max animate-marquee"
        style={{ ["--marquee-duration" as string]: `${run.length * SECONDS_PER_TILE}s` }}
      >
        <StripRun brands={run} />
        {/* The second pass is decorative — screen readers hear the list once. */}
        <StripRun brands={run} ariaHidden />
      </div>
    </section>
  );
}

function StripRun({ brands, ariaHidden = false }: { brands: StripBrand[]; ariaHidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-stretch" aria-hidden={ariaHidden || undefined}>
      {brands.map((brand, i) => (
        <li
          key={`${brand.id}-${i}`}
          // The margin is on every tile, including the last, so a run's width
          // is a whole number of tile-plus-gap units and the two runs are
          // exactly equal.
          className="marquee-item mr-1.5 w-[52vw] shrink-0 sm:w-[34vw] lg:w-[20.5vw]"
        >
          <Link
            href={`/shop?brand=${brand.slug}`}
            tabIndex={ariaHidden ? -1 : undefined}
            className="group relative block aspect-[4/5] overflow-hidden bg-paper-sunk"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.tileUrl}
              alt={brand.name}
              loading="lazy"
              // Grey until pointed at. Six photographs at full colour all
              // compete; grey lets the strip read as one band and makes the
              // tile under the pointer the only thing in colour.
              className="h-full w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
            />

            {/* Just enough veil to keep a white label readable over any photo. */}
            <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-ink/25 transition-opacity duration-700 group-hover:opacity-70" />

            {/* A shadow on the type rather than a heavier veil on the photo:
                the label has to hold against a bright tile without the whole
                strip being dimmed to achieve it. */}
            <span className="label absolute inset-0 flex items-center justify-center px-3 text-center text-paper [text-shadow:0_1px_14px_rgb(42_31_23_/_0.85)]">
              {brand.name}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
