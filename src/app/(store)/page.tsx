import Link from "next/link";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { Hero } from "@/components/sections/Hero";
import { HeroSlider } from "@/components/sections/HeroSlider";
import { NewArrivalsDeck } from "@/components/sections/NewArrivalsDeck";
import { DiscoverSplit } from "@/components/sections/DiscoverSplit";
import { ServiceRail } from "@/components/sections/ServiceRail";
import { ProductRail } from "@/components/sections/ProductRail";
import { LegacyBand } from "@/components/sections/LegacyBand";
import { BrandStripScroll } from "@/components/sections/BrandStripScroll";
import { MustHaveSpotlight } from "@/components/sections/MustHaveSpotlight";
import { IntroducingBrand } from "@/components/sections/IntroducingBrand";
import { InstagramBand } from "@/components/sections/InstagramBand";
import { SETTING_KEYS, getSettings } from "@/lib/settings";

export default async function HomePage() {
  // One round of parallel queries for the whole page — each section is a pure
  // renderer, so nothing below fetches on its own.
  const settings = await getSettings();

  const [banners, featured, brands, discoverPanels, newArrivalBrands, instaPosts] = await Promise.all([
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
    db.product.findMany({
      where: { status: "ACTIVE", isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: 8,
      select: productCardSelect,
    }),
    // The strip needs an image as well as the flag — an entry without one is
    // just a gap in the run.
    db.brand.findMany({
      where: { showInBrandStrip: true, logoUrl: { not: null } },
      orderBy: { sortOrder: "asc" },
      take: 20,
      select: { id: true, name: true, slug: true, logoUrl: true },
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
    db.instagramPost.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
      select: { id: true, imageUrl: true, href: true, caption: true },
    }),
  ]);

  // The two admin-picked bands. Each is skipped entirely when nothing is
  // chosen, rather than falling back to an arbitrary product or brand — a
  // homepage slot showing something nobody selected is worse than no slot.
  const mustHaveId = settings[SETTING_KEYS.mustHaveProductId];
  const mustHave = mustHaveId
    ? await db.product.findFirst({
        where: { id: mustHaveId, status: "ACTIVE" },
        select: {
          id: true, name: true, slug: true, mrp: true, price: true,
          brand: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
          variants: {
            orderBy: { createdAt: "asc" },
            select: { id: true, colorName: true, colorHex: true, stock: true, priceOverride: true },
          },
        },
      })
    : null;

  const introBrandId = settings[SETTING_KEYS.introducingBrandId];
  const introBrand = introBrandId
    ? await db.brand.findUnique({
        where: { id: introBrandId },
        select: {
          name: true,
          slug: true,
          products: {
            where: { status: "ACTIVE" },
            orderBy: { createdAt: "desc" },
            take: 4,
            select: {
              id: true, name: true, slug: true, mrp: true, price: true,
              images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true, alt: true } },
            },
          },
        },
      })
    : null;

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

      {mustHave && mustHave.variants.length > 0 && (
        <MustHaveSpotlight
          product={mustHave}
          heading={settings[SETTING_KEYS.mustHaveHeading] || "Eyewear You Must Have!"}
        />
      )}

      <BrandStripScroll
        brands={brands.map((b) => ({ ...b, logoUrl: b.logoUrl! }))}
      />

      <ServiceRail />

      {introBrand && (
        <IntroducingBrand
          brand={{ name: introBrand.name, slug: introBrand.slug }}
          products={introBrand.products}
          eyebrow={settings[SETTING_KEYS.introducingEyebrow] || "Introducing"}
        />
      )}

      <InstagramBand
        posts={instaPosts}
        handle={settings[SETTING_KEYS.instagramHandle] || "@broadwayopticals"}
        profileUrl={settings[SETTING_KEYS.instagramUrl] || "https://instagram.com"}
        heading={settings[SETTING_KEYS.instagramHeading] || "Follow Along"}
      />

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


      <LegacyBand />


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
