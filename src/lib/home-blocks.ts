import { db } from "@/lib/db";

/** Where on the homepage a brand block can sit. */
export const PLACEMENTS = {
  afterRails: "AFTER_RAILS",
  underNewArrivals: "UNDER_NEW_ARRIVALS",
} as const;

export type Placement = (typeof PLACEMENTS)[keyof typeof PLACEMENTS];

export const PLACEMENT_LABELS: Record<Placement, string> = {
  AFTER_RAILS: "Below the product rows",
  UNDER_NEW_ARRIVALS: "Under New on the Rack",
};

/** A frame shown beside a block's copy. */
export type BlockProduct = {
  id: string;
  name: string;
  slug: string;
  mrp: number;
  price: number;
  imageUrl: string | null;
  priceHidden: boolean;
};

export type BrandBlockData = {
  id: string;
  placement: string;
  eyebrow: string | null;
  heading: string | null;
  blurb: string | null;
  ctaLabel: string | null;
  products: BlockProduct[];
  brand: {
    name: string;
    slug: string;
    logoUrl: string | null;
    accentHex: string | null;
    isStoreExclusive: boolean;
  };
};

/**
 * Every active brand block, in one query, grouped by placement.
 *
 * Grouped here rather than queried per slot so the homepage keeps its single
 * round of parallel reads — a section that fetches for itself is how a page
 * ends up with a dozen sequential queries.
 */
export async function getBrandBlocks(): Promise<Record<string, BrandBlockData[]>> {
  const rows = await db.homeBrandBlock.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      placement: true,
      eyebrow: true,
      heading: true,
      blurb: true,
      ctaLabel: true,
      productAId: true,
      productBId: true,
      brand: {
        select: {
          name: true,
          slug: true,
          logoUrl: true,
          accentHex: true,
          isStoreExclusive: true,
        },
      },
    },
  });

  // The chosen frames, fetched once for every block rather than per block.
  // A block keeps working when its product is deleted or taken off sale: the
  // id simply matches nothing and the block falls back to centred.
  const wanted = [...new Set(rows.flatMap((r) => [r.productAId, r.productBId]))].filter(
    (id): id is string => Boolean(id)
  );

  const products = wanted.length
    ? await db.product.findMany({
        where: { id: { in: wanted }, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          slug: true,
          mrp: true,
          price: true,
          brand: { select: { isStoreExclusive: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      })
    : [];

  const byId = new Map<string, BlockProduct>(
    products.map((p) => [
      p.id,
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        mrp: p.mrp,
        price: p.price,
        imageUrl: p.images[0]?.url ?? null,
        priceHidden: Boolean(p.brand?.isStoreExclusive),
      },
    ])
  );

  const grouped: Record<string, BrandBlockData[]> = {};
  for (const row of rows) {
    const { productAId, productBId, ...rest } = row;
    const chosen = [productAId, productBId]
      .map((id) => (id ? byId.get(id) : undefined))
      .filter((p): p is BlockProduct => Boolean(p));

    (grouped[row.placement] ??= []).push({ ...rest, products: chosen });
  }
  return grouped;
}
