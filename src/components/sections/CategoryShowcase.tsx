import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Category = {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

/**
 * Departments as an editorial mosaic. The first tile is deliberately twice the
 * height of the rest — a uniform grid of five equal boxes reads as a menu,
 * not a storefront.
 */
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  const [lead, ...rest] = categories;

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
      <p className="label text-brass">The Departments</p>
      <h2 className="display mt-3 max-w-2xl text-[clamp(1.85rem,4vw,3rem)]">
        Everything we make, <em>you</em> see through.
      </h2>

      <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <CategoryTile category={lead} className="lg:row-span-2" tall />
        {rest.slice(0, 4).map((category) => (
          <CategoryTile key={category.slug} category={category} />
        ))}
      </div>
    </section>
  );
}

function CategoryTile({
  category,
  className = "",
  tall = false,
}: {
  category: Category;
  className?: string;
  tall?: boolean;
}) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`group relative overflow-hidden bg-paper-sunk ${
        tall ? "min-h-[22rem] lg:min-h-0" : "min-h-[15rem]"
      } ${className}`}
    >
      {category.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
        />
      )}

      {/* Ink veil, heavier at the foot where the type sits. */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />

      <div className="relative flex h-full flex-col justify-end p-6 lg:p-7">
        <h3 className={`display text-paper ${tall ? "text-4xl" : "text-2xl"}`}>{category.name}</h3>
        {category.description && (
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-paper/70">
            {category.description}
          </p>
        )}
        <span className="label mt-4 flex items-center gap-2 text-brass-soft">
          Shop now
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
            strokeWidth={2}
          />
        </span>
      </div>
    </Link>
  );
}
