import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { SETTING_KEYS, getSettings } from "@/lib/settings";
import { brandEnquiryLink } from "@/lib/whatsapp";

const BRAND_TAKE = 12;
const SHOP_TAKE = 8;

async function getBrand(slug: string) {
  return db.brand.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      bannerUrl: true,
      tileUrl: true,
      description: true,
      accentHex: true,
      posterHasLogo: true,
      isPremium: true,
      story: true,
      storyImageUrl: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Brand not found" };

  return {
    title: brand.name,
    description:
      brand.description?.slice(0, 160) ??
      `${brand.name} eyewear at Broadway Opticals — fitted by our own opticians.`,
  };
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const [products, settings] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE", brandId: brand.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: BRAND_TAKE,
      select: productCardSelect,
    }),
    getSettings(),
  ]);

  // A house we list but have no stock for has nothing to put on a page, so the
  // enquiry is the page — same destination the brand wall sends them to.
  if (products.length === 0) {
    redirect(brandEnquiryLink(brand.name, settings[SETTING_KEYS.whatsappNumber]));
  }

  // When the brand's own frames run out, the shop carries on underneath rather
  // than the page simply stopping.
  const more = await db.product.findMany({
    where: { status: "ACTIVE", brandId: { not: brand.id } },
    orderBy: { createdAt: "desc" },
    take: SHOP_TAKE,
    select: productCardSelect,
  });

  // The cover, in the order the shop asked for: the house's own poster if
  // there is one, otherwise its logo centred on its own colour. A poster that
  // already carries the logo is left alone — printing ours over the top of
  // theirs is the one thing a brand will notice.
  const poster = brand.bannerUrl ?? brand.tileUrl;
  const backdrop = brand.accentHex?.trim() || null;

  // The house colour, published once as a custom property on the page root.
  // Everything below that should follow the brand — rules, the eyebrow, the
  // buttons — reads it from there rather than each taking its own copy, so
  // changing the colour in the admin changes the page in one place.
  const theme = backdrop
    ? ({ ["--brand" as string]: backdrop } as React.CSSProperties)
    : undefined;
  // Without a colour the page keeps the house palette, so a brand nobody has
  // themed still looks like Broadway rather than like a mistake.
  const brandInk = backdrop ? "text-[var(--brand)]" : "text-brass";
  const brandRule = backdrop ? "border-[var(--brand)]" : "border-brass";
  const showLogoOverPoster = Boolean(brand.logoUrl) && !brand.posterHasLogo;

  return (
    <div style={theme}>
      {/* ── Cover ── */}
      <section
        className="relative isolate h-[46svh] min-h-[20rem] overflow-hidden bg-ink lg:h-[58svh]"
        style={!poster && backdrop ? { backgroundColor: backdrop } : undefined}
      >
        {poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* The wash is for legibility over a photograph. On a flat brand
            colour there is nothing to wash out, and darkening the shop's
            chosen colour would be a different colour. */}
        {poster && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/25" />
        )}

        {/* No poster: the logo sits centred on the house colour, large. */}
        {!poster && brand.logoUrl && (
          <div className="absolute inset-0 flex items-center justify-center px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.name}
              fetchPriority="high"
              className={`max-h-24 w-auto max-w-[min(26rem,80vw)] object-contain lg:max-h-32 ${
                backdrop ? "brightness-0 invert" : ""
              }`}
            />
          </div>
        )}

        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-12 lg:px-10 lg:pb-16">
          <nav className="label mb-auto pt-8 text-paper/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-paper">
              Home
            </Link>
            <span className="mx-2 text-brass">/</span>
            <Link href="/shop" className="hover:text-paper">
              Shop
            </Link>
            <span className="mx-2 text-brass">/</span>
            <span className="text-paper">{brand.name}</span>
          </nav>

          {poster && showLogoOverPoster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl!}
              alt={brand.name}
              className="h-14 w-auto max-w-[16rem] object-contain object-left lg:h-20"
            />
          ) : poster || !brand.logoUrl ? (
            <h1 className="display text-[clamp(2.5rem,7vw,5rem)] text-paper">{brand.name}</h1>
          ) : (
            // The logo is already centred above; the name is still needed for
            // the page's heading, just not shown twice.
            <h1 className="sr-only">{brand.name}</h1>
          )}
        </div>
      </section>

      {/* ── About the house ── */}
      {brand.description && (
        <section className="border-b border-line bg-paper-raised">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-20">
            <p className={`label ${brandInk}`}>The House</p>
            <hr
              className={`mx-auto mt-5 w-16 border-0 border-t-2 ${brandRule}`}
              aria-hidden="true"
            />
            <p className="mt-6 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-soft">
              {brand.description}
            </p>
          </div>
        </section>
      )}

      {/* ── The long read, for the premium houses ── */}
      {brand.isPremium && (
        <section
          className="border-b border-line text-paper grain"
          style={{ backgroundColor: backdrop ?? "var(--color-ink)" }}
        >
          <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-24">
            <div className="deco-frame relative aspect-[4/5] overflow-hidden bg-paper-sunk/10 lg:order-last">
              {brand.storyImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brand.storyImageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="label absolute inset-0 flex items-center justify-center px-6 text-center text-[0.6rem] leading-relaxed text-paper/45">
                  Placeholder — upload a photograph for this house under
                  Categories &amp; Brands
                </span>
              )}
            </div>

            <div>
              <p className="label-lg text-brass-soft">The House</p>
              <h2 className="display mt-4 text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.1]">
                {brand.name}
              </h2>

              {brand.story ? (
                <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-paper/75">
                  {brand.story.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="label mt-6 max-w-md border border-dashed border-paper/25 px-5 py-4 text-[0.55rem] leading-relaxed text-paper/55">
                  Placeholder — the story for this house has not arrived yet.
                  Paste it under Categories &amp; Brands and it appears here.
                </p>
              )}

              <Link
                href={`/shop?brand=${brand.slug}`}
                className="label mt-9 inline-block border border-paper/60 px-10 py-4 text-paper transition-colors hover:bg-paper hover:text-ink"
              >
                Shop the Collection
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Their frames ── */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span
              className={`block h-0.5 w-12 ${backdrop ? "bg-[var(--brand)]" : "bg-brass"}`}
              aria-hidden="true"
            />
            <h2 className="display mt-4 text-[clamp(1.6rem,3.5vw,2.5rem)]">
              {brand.name} <em>frames</em>
            </h2>
          </div>
          <Link
            href={`/shop?brand=${brand.slug}`}
            className={`label link-rule pb-1 ${backdrop ? "text-[var(--brand)]" : "text-ink-soft"}`}
          >
            Filter &amp; sort all {brand.name} →
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-7">
          {products.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} priority={i < 4} />
            </li>
          ))}
        </ul>
      </section>

      {/* ── …and the shop carries on ── */}
      {more.length > 0 && (
        <section className="border-t border-line bg-paper-raised">
          <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label text-brass">Keep Looking</p>
                <h2 className="display mt-3 text-[clamp(1.6rem,3.5vw,2.5rem)]">
                  More from the <em>shop</em>
                </h2>
              </div>
              <Link href="/shop" className="label link-rule pb-1 text-ink-soft">
                Browse everything →
              </Link>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4 lg:gap-x-7">
              {more.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="label inline-block px-12 py-4 text-paper transition-opacity hover:opacity-85"
                style={{ backgroundColor: backdrop ?? "var(--color-ink)" }}
              >
                Shop All Eyewear
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
