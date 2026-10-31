import type { Prisma } from "@prisma/client";

/**
 * Keep `Product.soldOutAt` in step with the stock on its colourways.
 *
 * Called after anything that moves stock — an order, a restock, an edit in
 * the admin. Deriving it at write time rather than at read time means the
 * "sold out 10 days ago" clock starts at the moment the last one actually
 * went, not the first time someone happened to load the page afterwards.
 *
 * Takes a transaction client so it can run inside the same transaction that
 * moved the stock.
 */
export async function syncSoldOut(
  tx: Prisma.TransactionClient,
  productIds: string[]
): Promise<void> {
  const ids = [...new Set(productIds)].filter(Boolean);
  if (ids.length === 0) return;

  const products = await tx.product.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      soldOutAt: true,
      variants: { select: { stock: true } },
    },
  });

  for (const product of products) {
    const inStock = product.variants.some((v) => v.stock > 0);

    if (!inStock && !product.soldOutAt) {
      // Just ran out — start the clock.
      await tx.product.update({ where: { id: product.id }, data: { soldOutAt: new Date() } });
    } else if (inStock && product.soldOutAt) {
      // Restocked — clear it, so a frame that comes back is not delisted
      // ten days after it last ran out.
      await tx.product.update({ where: { id: product.id }, data: { soldOutAt: null } });
    }
  }
}
