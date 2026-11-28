import Link from "next/link";
import type { BlockProduct, BrandBlockData } from "@/lib/home-blocks";
import { brandEnquiryLink } from "@/lib/whatsapp";
import { formatPrice, discountPct } from "@/lib/utils";

/**
 * A brand block: the house's own logo on its own colour, one line of copy and
 * a way into its frames.
 *
 * The logo is the point, so it gets the centre and plenty of air. Houses we
 * stock in store only send the shopper to WhatsApp instead of the shop, which
 * is the same rule the brand tiles follow.
 */
export function BrandBlock({
  block,
  whatsapp,
}: {
  block: BrandBlockData;
  whatsapp?: string | null;
}) {
  const { brand } = block;
  const backdrop = brand.accentHex?.trim() || null;

  // A backdrop the shop has chosen is nearly always a deep brand colour, so
  // the copy flips to cream over it. Without one the block stays on the
  // house's own raised cream and keeps ink text.
  const onColour = Boolean(backdrop);

  const href = brand.isStoreExclusive
    ? brandEnquiryLink(brand.name, whatsapp)
    : `/shop?brand=${brand.slug}`;

  const cta =
    block.ctaLabel?.trim() ||
    (brand.isStoreExclusive ? "Enquire on WhatsApp" : "Shop the Brand");

  // With frames chosen the block becomes a split: copy on the left, frames
  // on the right. With none it stays the centred band it has always been,
  // so adding this did not change any block already in use.
  const split = block.products.length > 0;

  return (
    <section
      className={`border-y border-line ${onColour ? "" : "bg-paper-raised"}`}
      style={backdrop ? { backgroundColor: backdrop } : undefined}
    >
      <div
        className={
          split
            ? "mx-auto grid max-w-[1500px] items-center gap-10 px-5 py-14 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:px-10 lg:py-20"
            : "mx-auto flex max-w-[1500px] flex-col items-center px-5 py-14 text-center lg:px-10 lg:py-20"
        }
      >
        <div className={split ? "flex flex-col items-start text-left" : "contents"}>
        {block.eyebrow && (
          <p className={`label-lg ${onColour ? "text-paper/70" : "text-brass"}`}>
            {block.eyebrow}
          </p>
        )}

        {/* The logo, held to a band of fixed height so brands with very
            different artwork proportions still line up down the page. */}
        {brand.logoUrl ? (
          <div className="mt-5 flex h-16 items-center justify-center lg:h-20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.name}
              loading="lazy"
              className={`max-h-full w-auto max-w-[min(18rem,70vw)] object-contain ${
                onColour ? "brightness-0 invert" : ""
              }`}
            />
          </div>
        ) : (
          // No logo uploaded yet. Say so plainly rather than silently showing
          // the name as if that were the design.
          <div className="mt-5">
            <p
              className={`label-lg text-[1.5rem] tracking-[0.2em] ${
                onColour ? "text-paper" : "text-ink"
              }`}
            >
              {brand.name}
            </p>
            <p
              className={`label mt-2 text-[0.6rem] ${
                onColour ? "text-paper/55" : "text-ink-muted"
              }`}
            >
              Placeholder — upload this brand&rsquo;s logo under Brands
            </p>
          </div>
        )}

        {block.heading && (
          <h2
            className={`display mt-6 max-w-2xl text-[clamp(1.5rem,4vw,2.5rem)] leading-[1.15] ${
              onColour ? "text-paper" : "text-ink"
            }`}
          >
            {block.heading}
          </h2>
        )}

        {block.blurb && (
          <p
            className={`mt-4 max-w-xl text-[0.95rem] leading-relaxed ${
              onColour ? "text-paper/75" : "text-ink-soft"
            }`}
          >
            {block.blurb}
          </p>
        )}

        <Link
          href={href}
          {...(brand.isStoreExclusive
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className={`label mt-9 inline-block px-12 py-4 transition-colors ${
            onColour
              ? "border border-paper/70 text-paper hover:bg-paper hover:text-ink"
              : "btn-ink"
          }`}
        >
          {cta}
        </Link>
        </div>

        {split && (
          <ul
            className={`grid gap-5 ${
              block.products.length > 1 ? "grid-cols-2" : "mx-auto max-w-sm grid-cols-1"
            }`}
          >
            {block.products.map((product) => (
              <li key={product.id}>
                <BlockFrame product={product} onColour={onColour} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/**
 * One frame beside a brand block.
 *
 * Deliberately plainer than the shop card — no colour dots, no New badge.
 * This is a brand showcase, and a row of badges would pull against it.
 */
function BlockFrame({
  product,
  onColour,
}: {
  product: BlockProduct;
  onColour: boolean;
}) {
  const save = product.priceHidden ? 0 : discountPct(product.mrp, product.price);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-sunk">
        {product.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        {save > 0 && (
          <span className="label absolute left-3 top-3 bg-clay px-2.5 py-1.5 text-paper">
            Save {save}%
          </span>
        )}
      </div>

      <p
        className={`label mt-4 text-[0.7rem] transition-colors ${
          onColour ? "text-paper group-hover:text-brass-soft" : "text-ink group-hover:text-brass"
        }`}
      >
        {product.name}
      </p>

      <p className="label mt-2 text-[0.7rem]">
        {product.priceHidden ? (
          <span className={onColour ? "text-paper/70" : "text-ink-muted"}>Price in store</span>
        ) : (
          <>
            <span className={save > 0 ? "text-clay" : onColour ? "text-paper/70" : "text-ink-soft"}>
              {formatPrice(product.price)}
            </span>
            {save > 0 && (
              <span className={`ml-2 line-through ${onColour ? "text-paper/45" : "text-ink-muted"}`}>
                {formatPrice(product.mrp)}
              </span>
            )}
          </>
        )}
      </p>
    </Link>
  );
}

/** A run of blocks for one placement. Renders nothing when the slot is empty. */
export function BrandBlocks({
  blocks,
  whatsapp,
}: {
  blocks: BrandBlockData[] | undefined;
  whatsapp?: string | null;
}) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <>
      {blocks.map((block) => (
        <BrandBlock key={block.id} block={block} whatsapp={whatsapp} />
      ))}
    </>
  );
}
