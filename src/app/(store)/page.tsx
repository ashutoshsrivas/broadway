import Link from "next/link";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { Hero } from "@/components/sections/Hero";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { NewArrivalsDeck } from "@/components/sections/NewArrivalsDeck";
import { DiscoverSplit } from "@/components/sections/DiscoverSplit";
import { ServiceRail } from "@/components/sections/ServiceRail";
import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { ProductRail } from "@/components/sections/ProductRail";
import { LegacyBand } from "@/components/sections/LegacyBand";
import { BrandStrip } from "@/components/sections/BrandStrip";

export default async function HomePage() {
  // One round of parallel queries for the whole page — each section is a pure
  // renderer, so nothing below fetches on its own.
  const [banners, categories, featured, brands, discoverPanels, newArrivalBrands] = await Promise.all([
    db.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true, mediaUrl: true, mediaType: true, posterUrl: true,
        eyebrow: true, heading: true, subheading: true,
        ctaLabel: true, ctaHref: true, align: true,
        overlay: true, durationMs: true,
      },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 5,
      select: { name: true, slug: true, description: true, imageUrl: true },
    }),
    db.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
      select: productCardSelect,
    }),
    db.brand.findMany({
      where: { isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 10,
      select: { name: true, slug: true },
    }),
    db.discoverPanel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true, eyebrow: true, heading: true,
        mediaUrl: true, posterUrl: true, href: true, overlay: true,
      },
    }),
    // Brands tabbed in the arrivals deck, each with its own newest stock.
    db.brand.findMany({
      where: { showInNewArrivals: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
      select: {
        id: true,
        name: true,
        slug: true,
        products: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: productCardSelect,
        },
      },
    }),
  ]);

  // A brand with nothing new has an empty tab, which reads as a mistake —
  // drop it rather than show it.
  const arrivalBrands = newArrivalBrands.filter((b) => b.products.length > 0);

  return (
    <>
      {/* The banner deck is admin-managed and may legitimately be empty — a
          fresh install, or every slide switched off mid-campaign. The original
          static hero stands in so the homepage never opens on a void. */}
      {banners.length > 0 ? <HeroSlider slides={banners} /> : <Hero />}

      <NewArrivalsDeck brands={arrivalBrands} />

      <DiscoverSplit panels={discoverPanels} />

      <ServiceRail />

      <ProductRail
        eyebrow="Featured Picks"
        title={
          <>
            This season&rsquo;s <em>best sellers</em>
          </>
        }
        blurb="The frames leaving our shelves fastest, chosen by the people who fit them."
        href="/shop"
        products={featured}
      />

      <CategoryShowcase categories={categories} />

      <LegacyBand />

      <BrandStrip brands={brands} />

      {/* Closing call to the stores — the part of the business a website can't replace. */}
      <section className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
        <div className="deco-frame border border-line bg-paper-raised px-6 py-14 text-center lg:px-16 lg:py-20">
          <p className="label text-brass">Book an Appointment</p>
          <h2 className="display mx-auto mt-4 max-w-2xl text-[clamp(1.85rem,4vw,3rem)]">
            A frame is only right once it&rsquo;s <em>fitted</em>.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
            Walk into any Broadway store for a complimentary eye test, a lens consultation and a
            fitting on the house — whether you bought the frame from us or not.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/stores" className="btn-ink label px-10 py-4">
              Find a Store
            </Link>
            <Link href="/contact" className="btn-outline label px-10 py-4">
              Talk to an Optician
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
