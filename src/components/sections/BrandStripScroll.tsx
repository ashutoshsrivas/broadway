import Link from "next/link";

export type StripBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
};

/**
 * "Discover our luxury brands" — a continuous strip of brand tiles.
 *
 * The track holds the brands twice and slides left by exactly half its width,
 * so the loop has no visible seam. Speed is expressed as seconds-per-tile and
 * the duration is derived from the count, which keeps the strip moving at the
 * same pace whether the shop features four houses or forty — a fixed duration
 * would make a long list race past.
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
        className="flex w-max gap-1.5"
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
    <ul className="flex shrink-0 items-stretch gap-1.5 animate-marquee" aria-hidden={ariaHidden || undefined}>
      {brands.map((brand, i) => (
        <li key={`${brand.id}-${i}`} className="w-[52vw] shrink-0 sm:w-[34vw] lg:w-[20.5vw]">
          <Link
            href={`/shop?brand=${brand.slug}`}
            tabIndex={ariaHidden ? -1 : undefined}
            className="group relative block aspect-[4/5] overflow-hidden bg-paper-sunk"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />

            {/* Just enough veil to keep a white label readable over any photo. */}
            <span className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-ink/25" />

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
