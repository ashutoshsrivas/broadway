import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Editorial } from "@/lib/shop-grid";

/**
 * An editorial image occupying four product cells in the shop grid.
 *
 * The image is absolutely positioned inside a spanning cell rather than laid
 * out in flow: a tall image in a `row-span-2` cell would otherwise force both
 * of those grid rows taller and push every product card beside it out of
 * alignment. This way the tile fills whatever height the two rows happen to
 * be and the cards around it are untouched — which is the whole point.
 */
export function ShopEditorialTile({ editorial }: { editorial: Editorial }) {
  const body = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={editorial.imageUrl}
        alt={editorial.heading ?? ""}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />

      {(editorial.eyebrow || editorial.heading) && (
        <>
          <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
          <span className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
            {editorial.eyebrow && (
              <span className="label block text-brass-soft">{editorial.eyebrow}</span>
            )}
            {editorial.heading && (
              <span className="display mt-3 block text-2xl leading-tight text-paper lg:text-3xl">
                {editorial.heading}
              </span>
            )}
            {editorial.href && (
              <span className="label mt-4 inline-flex items-center gap-2 text-paper">
                Explore
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2}
                />
              </span>
            )}
          </span>
        </>
      )}
    </>
  );

  // Two columns always; two rows only once the grid has three columns, since
  // on a two-column phone layout a 2x2 block would be a full screen of image.
  const cell =
    "group relative col-span-2 block min-h-[20rem] overflow-hidden bg-paper-sunk lg:row-span-2 lg:min-h-0";

  return editorial.href ? (
    <Link href={editorial.href} className={cell}>
      {body}
    </Link>
  ) : (
    <div className={cell}>{body}</div>
  );
}
