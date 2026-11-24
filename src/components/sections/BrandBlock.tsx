import Link from "next/link";
import type { BrandBlockData } from "@/lib/home-blocks";
import { brandEnquiryLink } from "@/lib/whatsapp";

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

  return (
    <section
      className={`border-y border-line ${onColour ? "" : "bg-paper-raised"}`}
      style={backdrop ? { backgroundColor: backdrop } : undefined}
    >
      <div className="mx-auto flex max-w-[1500px] flex-col items-center px-5 py-14 text-center lg:px-10 lg:py-20">
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
    </section>
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
