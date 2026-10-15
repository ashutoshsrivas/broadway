import Link from "next/link";

type Brand = { name: string; slug: string };

/**
 * The houses we carry, set as a tracked Bodoni roll-call rather than a row of
 * logos — we don't hold usable logo art for every brand, and mismatched
 * logo weights would look worse than type.
 */
export function BrandStrip({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="border-y border-line bg-ink py-14 text-paper">
      <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
        <p className="label text-center text-brass">The Houses We Carry</p>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <Link
                href={`/shop?brand=${brand.slug}`}
                className="font-display text-xl tracking-[0.08em] text-paper/55 transition-colors duration-300 hover:text-brass-soft lg:text-2xl"
              >
                {brand.name.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
