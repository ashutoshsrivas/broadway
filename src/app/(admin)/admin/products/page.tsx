import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice, discountPct } from "@/lib/utils";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      variants: { select: { stock: true } },
    },
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-brass">Catalogue</p>
          <h1 className="display mt-3 text-4xl">Products</h1>
          <p className="label mt-3 text-ink-muted">{products.length} total</p>
        </div>
        <Link href="/admin/products/new" className="btn-ink label flex items-center gap-2 px-7 py-3.5">
          <Plus className="h-4 w-4" strokeWidth={2} />
          New Product
        </Link>
      </div>

      <hr className="rule-deco mt-6 mb-8" />

      {products.length === 0 ? (
        <div className="border border-line bg-paper-raised px-6 py-20 text-center">
          <p className="display text-2xl">No products yet</p>
          <p className="mt-2.5 text-sm text-ink-muted">
            Add your first frame, or run <code className="text-brass">npm run db:seed</code>.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-line bg-paper-raised">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="label px-5 py-3.5 text-left text-ink-muted">Product</th>
                <th className="label px-5 py-3.5 text-left text-ink-muted">Category</th>
                <th className="label px-5 py-3.5 text-right text-ink-muted">Price</th>
                <th className="label px-5 py-3.5 text-right text-ink-muted">Stock</th>
                <th className="label px-5 py-3.5 text-left text-ink-muted">Status</th>
                <th className="label px-5 py-3.5 text-right text-ink-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => {
                const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                const save = discountPct(product.mrp, product.price);
                return (
                  <tr key={product.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="h-12 w-14 shrink-0 overflow-hidden bg-paper-sunk">
                          {product.images[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="label text-ink-muted">{product.brand?.name ?? "—"}</p>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="mt-1 block truncate font-display text-base hover:text-brass"
                          >
                            {product.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{product.category.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={save > 0 ? "text-clay" : ""}>
                        {formatPrice(product.price)}
                      </span>
                      {save > 0 && (
                        <span className="block text-xs text-ink-muted line-through">
                          {formatPrice(product.mrp)}
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-right tabular-nums ${
                        stock === 0 ? "text-clay" : stock <= 3 ? "text-brass" : ""
                      }`}
                    >
                      {stock}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`label border px-2.5 py-1.5 ${
                          product.status === "ACTIVE"
                            ? "border-forest/40 text-forest"
                            : product.status === "DRAFT"
                              ? "border-line text-ink-muted"
                              : "border-clay/40 text-clay"
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="label text-ink-muted hover:text-ink"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
