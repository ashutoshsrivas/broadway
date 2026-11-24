import { db } from "@/lib/db";
import { BannerManager } from "@/components/admin/BannerManager";
import { DiscoverManager } from "@/components/admin/DiscoverManager";
import { HomepagePicks } from "@/components/admin/HomepagePicks";
import { InstagramManager } from "@/components/admin/InstagramManager";
import { ShopEditorialManager } from "@/components/admin/ShopEditorialManager";
import { ExclusiveSettings } from "@/components/admin/ExclusiveSettings";
import { PromoSettings } from "@/components/admin/PromoSettings";
import { NavManager } from "@/components/admin/NavManager";
import { BrandBlockManager } from "@/components/admin/BrandBlockManager";
import { TrustBoxManager } from "@/components/admin/TrustBoxManager";
import { HomepageControls } from "@/components/admin/HomepageControls";
import { HomeServiceSettings } from "@/components/admin/HomeServiceSettings";
import { getNavLinks } from "@/lib/nav";
import { EXCLUSIVE_WHERE } from "@/lib/exclusive";
import { SETTING_KEYS, getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const [
    banners,
    panels,
    settings,
    products,
    brands,
    instaPosts,
    editorials,
    exclusiveCount,
    navLinks,
    brandBlocks,
    trustBoxes,
  ] = await Promise.all([
    db.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.discoverPanel.findMany({ orderBy: { sortOrder: "asc" } }),
    getSettings(),
    db.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, brand: { select: { name: true } } },
    }),
    db.brand.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        accentHex: true,
        _count: { select: { products: true } },
      },
    }),
    db.instagramPost.findMany({ orderBy: { sortOrder: "asc" } }),
    db.shopEditorial.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.count({ where: { status: "ACTIVE", ...EXCLUSIVE_WHERE } }),
    getNavLinks().then(() => db.navLink.findMany({ orderBy: { sortOrder: "asc" } })),
    db.homeBrandBlock.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.trustBox.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);

  const totalMs = banners
    .filter((b) => b.isActive)
    .reduce((sum, b) => sum + b.durationMs, 0);

  return (
    <>
      <p className="label text-brass">Storefront</p>
      <h1 className="display mt-3 text-4xl">Homepage</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        The full-screen deck at the top of the homepage. Slides run in the order below and loop.
        {banners.filter((b) => b.isActive).length > 0 && (
          <>
            {" "}
            One full cycle currently takes{" "}
            <strong className="text-ink">{(totalMs / 1000).toFixed(1)}s</strong>.
          </>
        )}
      </p>
      <hr className="rule-deco mt-6 mb-8" />

      <section className="mb-16">
        <h2 className="label-lg">Navbar</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The row of links under the wordmark, in order. Seeded from your departments on first
          run — after that this is the authority, so adding a category no longer adds a link by
          itself.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <NavManager initial={navLinks} />
      </section>

      <h2 className="label-lg mb-5">Hero Banners</h2>
      <BannerManager initial={banners} />

      <section className="mt-16">
        <h2 className="label-lg">Discover Panels</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The split band below the arrivals deck — usually one panel for him and one for her.
          Each links into its corner of the shop. The thumbnail carries the panel while the video
          loads, and stands in entirely for a panel without one.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <DiscoverManager initial={panels} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Homepage Picks</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The must-have spotlight sits just before the brand strip; Introducing sits just after
          it. Either can be switched off by choosing nothing.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <HomepagePicks
          products={products.map((p) => ({
            id: p.id,
            label: p.name,
            sub: p.brand?.name ?? undefined,
          }))}
          brands={brands.map((b) => ({
            id: b.id,
            label: b.name,
            sub: `${b._count.products} product${b._count.products === 1 ? "" : "s"}`,
          }))}
          settings={settings}
          keys={SETTING_KEYS}
        />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Brand Blocks</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          A house&rsquo;s own logo on its own colour, with a button into its frames. One sits
          under New on the Rack and the rest below the product rows — that is where &ldquo;Shop
          the Brand&rdquo; goes. The logo and the colour come from the brand itself, under
          Categories &amp; Brands, so adding a new house is one upload and one block.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <BrandBlockManager
          initial={brandBlocks}
          brands={brands.map((b) => ({
            id: b.id,
            name: b.name,
            logoUrl: b.logoUrl,
            accentHex: b.accentHex,
          }))}
        />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Homepage Settings</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The notice strip, how long a frame counts as new, the category boxes and how much the
          homepage shows on a phone.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <HomepageControls settings={settings} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Trust Boxes</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The strip of four promises under the brand rail, and the same strip on the home-service
          page. All four are editable — wording, the line under it and the icon.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <TrustBoxManager initial={trustBoxes} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Home Service</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          An optician who travels — Dehradun, Rishikesh and Haridwar by default. Shows as a band
          on the homepage and as its own page.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <HomeServiceSettings settings={settings} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Instagram</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Uploaded images rather than a live feed — an Instagram token expires every 60 days and
          takes the band down with it. Post there, upload the good ones here.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <InstagramManager initial={instaPosts} settings={settings} keys={SETTING_KEYS} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Shop Editorial</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Images dropped into the shop grid between products, each filling the space of four
          product cards. Breaks up a long run of frames on white with something worn on a face.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <ShopEditorialManager
          initial={editorials}
          everyRows={settings[SETTING_KEYS.editorialEveryRows] ?? "3"}
          settingKey={SETTING_KEYS.editorialEveryRows}
        />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">BO Exclusive</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Mark a product as BO Exclusive while uploading it, or mark a whole department under
          Categories. The copy below is the badge wording and the notice shown on every exclusive
          product and at the head of <code className="text-brass">/bo-exclusive</code>.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <ExclusiveSettings settings={settings} keys={SETTING_KEYS} count={exclusiveCount} />
      </section>

      <section className="mt-16">
        <h2 className="label-lg">Welcome Offer</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          A one-time pop-up for first-time visitors, offering a flat percentage off their first
          order. A cookie remembers who has seen it, so nobody is shown it twice.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <PromoSettings settings={settings} keys={SETTING_KEYS} />
      </section>
    </>
  );
}
