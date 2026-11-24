import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/lib/db";
import { brandEnquiryLink } from "@/lib/whatsapp";
import { SETTING_KEYS, getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop by Brand",
  description: "Every house Broadway Opticals carries, listed A to Z.",
};

/**
 * Every brand, grouped by first letter.
 *
 * Deliberately flat: no featured row, no ordering by how much we like a
 * house. The shop said the current list was confusing, and the fix is that
 * the list is only ever alphabetical, so a shopper looking for one name knows
 * exactly where to look.
 */
export default async function ShopByBrandPage() {
  const [brands, settings] = await Promise.all([
    db.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        isStoreExclusive: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    }),
    getSettings(),
  ]);

  // Anything that does not start with a letter — a numeral, an accent — is
  // filed under # rather than creating a group of its own with one row in it.
  const groups = new Map<string, typeof brands>();
  for (const brand of brands) {
    const first = brand.name.trim().charAt(0).toUpperCase();
    const key = /[A-Z]/.test(first) ? first : "#";
    const list = groups.get(key) ?? [];
    list.push(brand);
    groups.set(key, list);
  }

  const letters = [...groups.keys()].sort((a, b) =>
    a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)
  );

  const whatsapp = settings[SETTING_KEYS.whatsappNumber];

  return (
    <>
      <PageHeader
        eyebrow="Shop by Brand"
        title="Every house we carry."
        blurb="Listed A to Z. A house with nothing on the shelf right now goes straight to WhatsApp — we can usually order it in."
      />

      {letters.length > 0 && (
        // The jump bar. Sticky on a phone, where the list is longest and the
        // scroll is slowest.
        <nav
          aria-label="Jump to a letter"
          className="sticky top-[var(--site-chrome,0px)] z-30 border-y border-line bg-paper-raised/95 backdrop-blur-sm"
        >
          <ul className="mx-auto flex max-w-[1500px] flex-wrap justify-center gap-x-3 gap-y-1.5 px-5 py-3 lg:px-10">
            {letters.map((letter) => (
              <li key={letter}>
                <a
                  href={`#letter-${letter === "#" ? "other" : letter}`}
                  className="label block px-1.5 py-1 text-[0.7rem] text-ink-soft transition-colors hover:text-brass"
                >
                  {letter}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section className="mx-auto max-w-[1500px] px-5 py-12 lg:px-10 lg:py-16">
        {letters.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink-muted">No brands yet.</p>
        ) : (
          letters.map((letter) => (
            <div
              key={letter}
              id={`letter-${letter === "#" ? "other" : letter}`}
              className="mb-12 scroll-mt-32 last:mb-0"
            >
              <h2 className="display border-b border-line pb-3 text-3xl text-brass">{letter}</h2>

              <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
                {groups.get(letter)!.map((brand) => {
                  const stocked = brand._count.products > 0;
                  return (
                    <li key={brand.id}>
                      {stocked ? (
                        <Link
                          href={`/brands/${brand.slug}`}
                          className="flex items-baseline justify-between gap-3 border-b border-line/60 py-3 transition-colors hover:text-brass"
                        >
                          <span className="label text-[0.7rem]">{brand.name}</span>
                          <span className="label text-[0.55rem] text-ink-muted">
                            {brand._count.products}
                          </span>
                        </Link>
                      ) : (
                        <a
                          href={brandEnquiryLink(brand.name, whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-baseline justify-between gap-3 border-b border-line/60 py-3 text-ink-muted transition-colors hover:text-brass"
                        >
                          <span className="label text-[0.7rem]">{brand.name}</span>
                          <span className="label text-[0.55rem]">Enquire</span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
