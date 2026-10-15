import { db } from "@/lib/db";
import { ProductForm, BLANK_PRODUCT } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <p className="label text-brass">Catalogue</p>
      <h1 className="display mt-3 text-4xl">New Product</h1>
      <hr className="rule-deco mt-6 mb-8" />

      <ProductForm initial={BLANK_PRODUCT} categories={categories} brands={brands} />
    </>
  );
}
