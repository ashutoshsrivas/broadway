import Link from "next/link";
import { formatPrice, discountPct } from "@/lib/utils";
import type { ProductCardData } from "@/lib/catalog";

/**
 * The catalogue tile.
 *
 * Reads top-down the way a shopper scans eyewear: image, house, model, price.
 * The second product image (when there is one) cross-fades in on hover — for
 * frames that is almost always the angled shot, which is the view that sells.
 */
export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const save = discountPct(product.mrp, product.price);
  const inStock = product.variants.some((v) => v.stock > 0);
  const [primary, secondary] = product.images;
  const colours = product.variants.filter((v) => v.colorHex).slice(0, 4);

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-sunk">
          {primary ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primary.url}
                alt={primary.alt ?? product.name}
                loading={priority ? "eager" : "lazy"}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  secondary ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
                }`}
              />
              {secondary && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={secondary.url}
                  alt=""
                  loading="lazy"
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-[1.04] object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="label text-ink-muted">Broadway</span>
            </div>
          )}

          {/* Badges — at most two, so the image stays the hero. */}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {save > 0 && (
              <span className="label bg-clay px-2.5 py-1.5 text-paper">Save {save}%</span>
            )}
            {product.isNewArrival && save === 0 && (
              <span className="label bg-ink px-2.5 py-1.5 text-paper">New</span>
            )}
          </div>

          {!inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
              <span className="label border border-ink px-4 py-2">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      <div className="pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label truncate text-ink-muted">{product.brand?.name ?? "Broadway"}</p>
          {product.shape && (
            <p className="label shrink-0 text-[0.6rem] text-brass">{product.shape}</p>
          )}
        </div>

        <h3 className="mt-1.5">
          <Link
            href={`/product/${product.slug}`}
            className="font-display text-lg leading-snug transition-colors hover:text-brass"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-2.5">
          <span className={`text-sm font-medium ${save > 0 ? "text-clay" : ""}`}>
            {formatPrice(product.price)}
          </span>
          {save > 0 && (
            <span className="text-xs text-ink-muted line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>

        {colours.length > 1 && (
          <ul className="mt-3 flex items-center gap-1.5" aria-label="Available colours">
            {colours.map((variant) => (
              <li
                key={variant.id}
                title={variant.colorName}
                className="h-2.5 w-2.5 rounded-full border border-line"
                style={{ backgroundColor: variant.colorHex! }}
              />
            ))}
            {product.variants.length > colours.length && (
              <li className="ml-0.5 text-[10px] text-ink-muted">
                +{product.variants.length - colours.length}
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
