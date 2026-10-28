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

  const banner = brand.bannerUrl ?? brand.tileUrl;

  return (
    <>
      {/* ── Banner ── */}
      <section className="relative isolate h-[46svh] min-h-[20rem] overflow-hidden bg-ink lg:h-[58svh]">
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/25" />

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

          {brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-14 w-auto max-w-[16rem] object-contain object-left lg:h-20"
            />
          ) : (
            <h1 className="display text-[clamp(2.5rem,7vw,5rem)] text-paper">{brand.name}</h1>
          )}
        </div>
      </section>

      {/* ── About the house ── */}
      {brand.description && (
        <section className="border-b border-line bg-paper-raised">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center lg:py-20">
            <p className="label text-brass">The House</p>
            <p className="mt-6 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-soft">
              {brand.description}
            </p>
          </div>
        </section>
      )}

      {/* ── Their frames ── */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[clamp(1.6rem,3.5vw,2.5rem)]">
            {brand.name} <em>frames</em>
          </h2>
          <Link href={`/shop?brand=${brand.slug}`} className="label link-rule pb-1 text-ink-soft">
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
              <Link href="/shop" className="btn-ink label inline-block px-12 py-4">
                Shop All Eyewear
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
