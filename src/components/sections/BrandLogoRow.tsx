import Link from "next/link";

export type LogoRowBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  stocked: boolean;
};

/**
 * A row of houses, shown as their own logos.
 *
 * Six is the design — two rows of three on a phone, one row of six from lg —
 * but the grid is driven off the count so five or seven still sit evenly
 * rather than leaving a hole in the last column.
 *
 * Logos keep their own light ground and are not knocked out to a single
 * colour: the artwork belongs to the house, and inverting it works for a
 * black wordmark and ruins one that is already light. They rest grey and
 * come to full colour under the pointer, which keeps six marks from
 * competing with each other at a glance.
 */
export function BrandLogoRow({
  brands,
  heading,
}: {
  brands: LogoRowBrand[];
  heading?: string | null;
}) {
  if (brands.length === 0) return null;

  const columns =
    {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      5: "sm:grid-cols-5",
      6: "sm:grid-cols-6",
    }[Math.min(brands.length, 6)] ?? "sm:grid-cols-6";

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-14 lg:px-10 lg:py-16">
        <h2 className="label text-center text-ink-muted">
          {heading?.trim() || "The Houses We Carry"}
        </h2>

        <ul className={`mt-9 grid grid-cols-3 gap-x-4 gap-y-8 ${columns} lg:gap-x-8`}>
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={brand.stocked ? `/brands/${brand.slug}` : `/shop-by-brand`}
                aria-label={brand.name}
                className="group flex h-14 items-center justify-center lg:h-16"
              >
                {brand.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logoUrl}
                    alt=""
                    loading="lazy"
                    className="max-h-full w-auto max-w-full object-contain opacity-55 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                ) : (
                  <span className="label text-center text-[0.65rem] text-ink-muted transition-colors group-hover:text-ink">
                    {brand.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
