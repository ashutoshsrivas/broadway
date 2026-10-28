import Link from "next/link";
import { formatPrice, discountPct } from "@/lib/utils";

export type IntroProduct = {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  price: number;
  images: { url: string; alt: string | null }[];
};

/**
 * "Introducing <house>" — the newest four frames from one brand.
 *
 * Deliberately plainer than the shop grid: no badges, no colour dots, type
 * centred under the frame. This band is a brand showcase, and a row of sale
 * flags would undercut that.
 */
export function IntroducingBrand({
  brand,
  products,
  eyebrow = "Introducing",
}: {
  brand: { name: string; slug: string };
  products: IntroProduct[];
  eyebrow?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-24">
        <p className="label text-center text-ink-muted">{eyebrow}</p>
        <h2 className="label-lg mt-4 text-center text-[1.6rem] tracking-[0.2em] text-ink">
          {brand.name}
        </h2>

        {/* Flex rather than a 4-column grid: a house with only two frames in
            stock would otherwise sit in the left half of the row with two
            empty tracks beside it. Wrapping flex items centre themselves. */}
        <ul className="mt-14 flex flex-wrap justify-center gap-x-5 gap-y-12 lg:gap-x-8">
          {products.map((product) => {
            const save = discountPct(product.mrp, product.price);
            return (
              <li
                key={product.id}
                className="w-[calc(50%-0.625rem)] lg:w-[calc(25%-1.5rem)]"
              >
                <Link href={`/product/${product.slug}`} className="group block text-center">
                  <div className="aspect-[4/3] overflow-hidden bg-paper">
                    {product.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt ?? product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    )}
                  </div>

                  <p className="label mt-6 text-ink-muted">{brand.name}</p>
                  <p className="label mt-2.5 text-[0.8rem] tracking-[0.14em] text-ink transition-colors group-hover:text-brass">
                    {product.name}
                  </p>
                  <p className="label mt-2.5 text-[0.8rem] tracking-[0.1em]">
                    <span className={save > 0 ? "text-clay" : "text-ink-soft"}>
                      {formatPrice(product.price)}
                    </span>
                    {save > 0 && (
                      <span className="ml-2 text-ink-muted line-through">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 text-center">
          <Link href={`/shop?brand=${brand.slug}`} className="btn-ink label inline-block px-14 py-4">
            Shop the Brand
          </Link>
        </div>
      </div>
    </section>
  );
}
