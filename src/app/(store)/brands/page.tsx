import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { SETTING_KEYS, getSettings } from "@/lib/settings";
import { OurBrands } from "@/components/sections/OurBrands";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Brands",
  description:
    "Every eyewear house Broadway Opticals carries — from Ray-Ban and Oakley to Tom Ford, Gucci and Prada. Can't see one? We can usually order it in.",
};

export default async function BrandsPage() {
  const [brands, settings] = await Promise.all([
    db.brand.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    }),
    getSettings(),
  ]);

  const stocked = brands.filter((b) => b._count.products > 0).length;

  return (
    <>
      <header className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-12 lg:px-10 lg:pt-16">
          <nav className="label mb-7 flex items-center gap-2 text-ink-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <span className="text-brass">/</span>
            <span className="text-ink">Our Brands</span>
          </nav>

          <p className="label text-brass">Our Brands</p>
          <h1 className="display mt-3 max-w-3xl text-[clamp(2.25rem,6vw,4rem)]">
            The houses we <em>carry</em>.
          </h1>
          <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">
            {stocked} house{stocked === 1 ? "" : "s"} in stock today, and a good many more we can
            order in. Every frame we sell is sourced from the brand or its authorised Indian
            distributor, and fitted by our own opticians.
          </p>
        </div>
      </header>

      <OurBrands
        brands={brands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          logoUrl: b.logoUrl,
          productCount: b._count.products,
        }))}
        whatsappNumber={settings[SETTING_KEYS.whatsappNumber]}
        showHeading={false}
      />
    </>
  );
}
