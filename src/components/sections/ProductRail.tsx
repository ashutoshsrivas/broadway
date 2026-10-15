import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import type { ProductCardData } from "@/lib/catalog";

/**
 * A run of products under a heading. On phones it scrolls horizontally with
 * snap points; from `md` up it becomes a plain grid — a carousel on desktop
 * only hides stock the shopper could otherwise see at a glance.
 */
export function ProductRail({
  eyebrow,
  title,
  blurb,
  href,
  products,
  tone = "paper",
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb?: string;
  href?: string;
  products: ProductCardData[];
  tone?: "paper" | "raised";
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "raised" ? "border-y border-line bg-paper-raised" : ""}>
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
        <SectionHeading eyebrow={eyebrow} title={title} blurb={blurb} href={href} />

        <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-12 md:overflow-visible md:pb-0 lg:grid-cols-4">
          {products.map((product, i) => (
            <li
              key={product.id}
              className="w-[74vw] shrink-0 snap-start sm:w-[45vw] md:w-auto md:shrink"
            >
              <ProductCard product={product} priority={i < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
