import { db } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { BrandManager } from "@/components/admin/BrandManager";

export default async function AdminCategoriesPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { products: true } } },
    }),
    db.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <>
      <p className="label text-brass">Catalogue</p>
      <h1 className="display mt-3 text-4xl">Categories & Brands</h1>
      <hr className="rule-deco mt-6 mb-8" />

      <CategoryManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          isActive: c.isActive,
          isBoExclusive: c.isBoExclusive,
          productCount: c._count.products,
        }))}
      />

      <section className="mt-16">
        <h2 className="label-lg">Brands</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          Upload an image per house and choose where it appears. The brand strip needs an image;
          the arrivals deck and the featured roll-call do not.
        </p>
        <hr className="rule-deco mt-5 mb-6" />

        <BrandManager
          initial={brands.map((b) => ({
            id: b.id,
            name: b.name,
            slug: b.slug,
            logoUrl: b.logoUrl,
            tileUrl: b.tileUrl,
            bannerUrl: b.bannerUrl,
            description: b.description,
            isFeatured: b.isFeatured,
            showInNewArrivals: b.showInNewArrivals,
            showInBrandStrip: b.showInBrandStrip,
            isStoreExclusive: b.isStoreExclusive,
            productCount: b._count.products,
          }))}
        />
      </section>
    </>
  );
}
