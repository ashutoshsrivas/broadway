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

export type BrandBlockData = {
  id: string;
  placement: string;
  eyebrow: string | null;
  heading: string | null;
  blurb: string | null;
  ctaLabel: string | null;
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

  const grouped: Record<string, BrandBlockData[]> = {};
  for (const row of rows) {
    (grouped[row.placement] ??= []).push(row);
  }
  return grouped;
}
