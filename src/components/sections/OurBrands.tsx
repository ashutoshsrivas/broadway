import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { brandEnquiryLink } from "@/lib/whatsapp";

export type WallBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
};

/**
 * Every house we list, as a wall of logos.
 *
 * A brand we stock goes to its own page. A brand we list but have no stock
 * for goes to WhatsApp with the enquiry pre-written — a brand page with an
 * empty grid tells a shopper nothing, whereas someone at the counter can say
 * whether we can order it in.
 */
export function OurBrands({
  brands,
  whatsappNumber,
  showHeading = true,
}: {
  brands: WallBrand[];
  whatsappNumber?: string | null;
  /** Off when the page around it already carries the title. */
  showHeading?: boolean;
}) {
  if (brands.length === 0) return null;

  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
        {showHeading && (
          <div className="mb-14 text-center">
            <p className="label text-brass">Our Brands</p>
            <h2 className="display mx-auto mt-4 max-w-2xl text-[clamp(1.85rem,4vw,3rem)]">
              The houses we <em>carry</em>.
            </h2>
          </div>
        )}

        <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <li key={brand.id} className="bg-paper">
              <BrandCell brand={brand} whatsappNumber={whatsappNumber} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-xs text-ink-muted">
          Don&rsquo;t see a house you&rsquo;re after? Message us — we can usually order it in.
        </p>
      </div>
    </section>
  );
}

function BrandCell({
  brand,
  whatsappNumber,
}: {
  brand: WallBrand;
  whatsappNumber?: string | null;
}) {
  const stocked = brand.productCount > 0;

  // The logo sits on paper at reduced opacity and comes up to full on hover,
  // which evens out a wall of logos drawn at different weights.
  const inner = (
    <>
      {brand.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={brand.logoUrl}
          alt={brand.name}
          loading="lazy"
          className="max-h-14 w-auto max-w-[70%] object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
      ) : (
        // No logo uploaded yet — the name set in the house face reads as a
        // deliberate wordmark rather than a missing image.
        <span className="label-lg px-4 text-center text-ink-soft transition-colors duration-300 group-hover:text-ink">
          {brand.name}
        </span>
      )}

      {!stocked && (
        <span className="label absolute bottom-3 right-3 flex items-center gap-1.5 text-[0.5rem] text-ink-muted transition-colors group-hover:text-brass">
          <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
          Enquire
        </span>
      )}
    </>
  );

  const className =
    "group relative flex aspect-[3/2] items-center justify-center bg-paper p-6 transition-colors hover:bg-paper-sunk";

  return stocked ? (
    <Link href={`/brands/${brand.slug}`} className={className} title={`Shop ${brand.name}`}>
      {inner}
    </Link>
  ) : (
    <a
      href={brandEnquiryLink(brand.name, whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={`Enquire about ${brand.name} on WhatsApp`}
    >
      {inner}
    </a>
  );
}
