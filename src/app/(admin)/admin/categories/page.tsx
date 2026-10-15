import { db } from "@/lib/db";
import { CategoryManager } from "@/components/admin/CategoryManager";

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
          productCount: c._count.products,
        }))}
        brands={brands.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          isFeatured: b.isFeatured,
          productCount: b._count.products,
        }))}
      />
    </>
  );
}
