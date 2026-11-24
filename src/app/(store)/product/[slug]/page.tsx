import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { ProductDetail } from "@/components/store/ProductDetail";
import { ProductRail } from "@/components/sections/ProductRail";
import { ExclusiveNotice } from "@/components/store/ExclusiveNotice";
import { isExclusive, exclusiveCopy } from "@/lib/exclusive";
import { SETTING_KEYS, getSettings } from "@/lib/settings";
import { productBlocks } from "@/lib/product-copy";
import { getTrustBoxes } from "@/lib/trust";
import { ServiceRail } from "@/components/sections/ServiceRail";

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      brand: { select: { name: true, slug: true, description: true, isStoreExclusive: true } },
      category: { select: { name: true, slug: true, gstPercent: true, isBoExclusive: true } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Frame not found" };

  const label = product.brand ? `${product.brand.name} ${product.name}` : product.name;
  return {
    title: label,
    description:
      product.description?.slice(0, 160) ??
      `${label} — available at Broadway Opticals with free lens fitting.`,
    openGraph: { images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const settings = await getSettings();
  const exclusive = isExclusive(product);
  const copy = exclusive ? exclusiveCopy(settings) : null;

  // The same house first, then the rest of the department. Someone looking at
  // a Persol is far more likely to want another Persol than another oval
  // frame, so the brand leads and the category fills in behind it.
  const RELATED_TAKE = 8;

  const [sameBrand, trustBoxes] = await Promise.all([
    product.brandId
      ? db.product.findMany({
          where: { status: "ACTIVE", brandId: product.brandId, id: { not: product.id } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: RELATED_TAKE,
          select: productCardSelect,
        })
      : Promise.resolve([]),
    getTrustBoxes(),
  ]);

  const sameCategory =
    sameBrand.length >= RELATED_TAKE
      ? []
      : await db.product.findMany({
          where: {
            status: "ACTIVE",
            categoryId: product.categoryId,
            id: { notIn: [product.id, ...sameBrand.map((p) => p.id)] },
          },
          orderBy: { sortOrder: "asc" },
          take: RELATED_TAKE - sameBrand.length,
          select: productCardSelect,
        });

  const related = [...sameBrand, ...sameCategory];

  return (
    <>
      {/* The phone buy bar is fixed over the foot of the screen, so the
          column needs room underneath it. */}
      <div className="mx-auto max-w-[1500px] px-5 pb-24 pt-10 lg:px-10 lg:pb-14 lg:pt-14">
        <nav className="label mb-9 flex flex-wrap items-center gap-2 text-ink-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <span className="text-brass">/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
          <span className="text-brass">/</span>
          <span className="truncate text-ink">{product.name}</span>
        </nav>

        <ProductDetail
          product={product}
          whatsappNumber={settings[SETTING_KEYS.whatsappNumber]}
          blocks={productBlocks(settings)}
          assistHeading={settings[SETTING_KEYS.productAssistHeading]}
          assistNote={settings[SETTING_KEYS.productAssistNote]}
        />

        {copy && (
          <div className="mt-14 lg:ml-auto lg:w-[calc((100%-4rem)*0.4762)]">
            <ExclusiveNotice copy={copy} />
          </div>
        )}
      </div>

      {/* 5 — the four promises, as a strip rather than a list in the column. */}
      <ServiceRail boxes={trustBoxes} />

      {/* 6 — the same house first. */}
      <ProductRail
        eyebrow="You May Also Like"
        title={
          sameBrand.length > 0 && product.brand ? (
            <>
              More from <em>{product.brand.name}</em>
            </>
          ) : (
            <>
              More from <em>{product.category.name}</em>
            </>
          )
        }
        href={
          sameBrand.length > 0 && product.brand
            ? `/shop?brand=${product.brand.slug}`
            : `/shop?category=${product.category.slug}`
        }
        products={related}
        tone="raised"
      />
    </>
  );
}
