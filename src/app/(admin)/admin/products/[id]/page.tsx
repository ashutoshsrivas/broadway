import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) notFound();

  return (
    <>
      <p className="label text-brass">Catalogue</p>
      <h1 className="display mt-3 text-4xl">{product.name}</h1>
      <hr className="rule-deco mt-6 mb-8" />

      <ProductForm
        categories={categories}
        brands={brands}
        // The form holds every field as a string (that's what inputs give back),
        // so nulls and numbers are flattened here rather than in the component.
        initial={{
          id: product.id,
          name: product.name,
          description: product.description ?? "",
          categoryId: product.categoryId,
          brandId: product.brandId ?? "",
          mrp: String(product.mrp),
          price: String(product.price),
          gender: product.gender,
          shape: product.shape ?? "",
          material: product.material ?? "",
          size: product.size ?? "",
          countryOfOrigin: product.countryOfOrigin ?? "",
          frameType: product.frameType ?? "",
          lensType: product.lensType ?? "",
          status: product.status,
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isLimitedEdition: product.isLimitedEdition,
          isBoExclusive: product.isBoExclusive,
          images: product.images.map((image) => image.url),
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            colorName: variant.colorName,
            colorHex: variant.colorHex ?? "#2A1F17",
            priceOverride: variant.priceOverride ? String(variant.priceOverride) : "",
            stock: String(variant.stock),
          })),
        }}
      />
    </>
  );
}
