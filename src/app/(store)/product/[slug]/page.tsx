import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { ProductDetail } from "@/components/store/ProductDetail";
import { ProductRail } from "@/components/sections/ProductRail";

async function getProduct(slug: string) {
  return db.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, slug: true } },
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

  // Same department, different frame — the only "related" rule worth having
  // without a recommendation engine.
  const related = await db.product.findMany({
    where: { status: "ACTIVE", categoryId: product.categoryId, id: { not: product.id } },
    orderBy: { sortOrder: "asc" },
    take: 4,
    select: productCardSelect,
  });

  return (
    <>
      <div className="mx-auto max-w-[1500px] px-5 py-10 lg:px-10 lg:py-14">
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

        <ProductDetail product={product} />
      </div>

      <ProductRail
        eyebrow="You May Also Like"
        title={
          <>
            More from <em>{product.category.name}</em>
          </>
        }
        href={`/shop?category=${product.category.slug}`}
        products={related}
        tone="raised"
      />
    </>
  );
}
