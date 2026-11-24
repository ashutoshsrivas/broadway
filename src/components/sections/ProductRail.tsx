import { ProductCard } from "@/components/store/ProductCard";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { RevealGrid } from "@/components/store/RevealGrid";
import type { ProductCardData } from "@/lib/catalog";

/**
 * A run of products under a heading.
 *
 * A two-up grid on phones rather than a swipe rail: the shop asked for a
 * fixed number of cards with a way to see the rest, and a horizontal
 * scroller hides everything past the second card behind a gesture people
 * routinely miss. `mobileLimit` is set in the admin panel.
 */
export function ProductRail({
  eyebrow,
  title,
  blurb,
  href,
  products,
  tone = "paper",
  mobileLimit = 6,
  newDays,
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb?: string;
  href?: string;
  products: ProductCardData[];
  tone?: "paper" | "raised";
  mobileLimit?: number;
  newDays?: number;
}) {
  if (products.length === 0) return null;

  return (
    <section className={tone === "raised" ? "border-y border-line bg-paper-raised" : ""}>
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
        <SectionHeading eyebrow={eyebrow} title={title} blurb={blurb} href={href} />

        <RevealGrid limit={mobileLimit}>
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} newDays={newDays} />
          ))}
        </RevealGrid>
      </div>
    </section>
  );
}
