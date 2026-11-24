import Link from "next/link";

export type CategoryBox = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

/**
 * The category boxes, in the two forms the shop asked to compare.
 *
 * `mode` comes from the admin panel:
 *   "hidden" — no boxes at all. The shop's preference, and the default.
 *   "hover"  — the image is bare until pointed at, and the label and frame
 *              fade in on hover.
 *
 * A phone has no hover, so under "hover" a touch screen gets the revealed
 * state permanently (see `.reveal-on-hover` in globals.css, which turns
 * itself off under `hover: none`). Otherwise the labels would be invisible
 * to exactly the shoppers who matter most here.
 */
export function CategoryBoxes({
  mode,
  categories,
}: {
  mode: string;
  categories: CategoryBox[];
}) {
  if (mode !== "hover") return null;
  if (categories.length === 0) return null;

  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-14 lg:px-10 lg:py-20">
        <h2 className="label text-center text-ink-muted">Shop by Category</h2>

        <ul className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/shop?category=${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-paper-sunk lg:aspect-[4/3]"
              >
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.imageUrl}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                ) : (
                  <span className="label absolute inset-0 flex items-center justify-center px-3 text-center text-[0.55rem] leading-relaxed text-ink-muted">
                    Placeholder — add an image to this category
                  </span>
                )}

                {/* The chrome that appears on hover: a wash, a hairline and
                    the name. Permanently on where there is no hover. */}
                <span className="reveal-on-hover absolute inset-0 bg-ink/45 transition-opacity duration-500" />
                <span className="reveal-on-hover absolute inset-3 border border-paper/45 transition-opacity duration-500" />
                <span className="reveal-on-hover label absolute inset-x-0 bottom-0 p-5 text-center text-paper transition-opacity duration-500">
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
