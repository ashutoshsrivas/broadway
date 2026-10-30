import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { EXCLUSIVE_WHERE } from "@/lib/exclusive";

export const PAGE_SIZE = 24;

export type ShopFilters = {
  category?: string;
  brand?: string[];
  gender?: string[];
  shape?: string[];
  material?: string[];
  frameType?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  exclusive?: boolean;
  sort?: string;
  page?: number;
};

/** Product shape every grid on the site renders from. */
export const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  mrp: true,
  price: true,
  gender: true,
  shape: true,
  isNewArrival: true,
  isBoExclusive: true,
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true, isBoExclusive: true } },
  images: { orderBy: { sortOrder: "asc" }, take: 2, select: { url: true, alt: true } },
  variants: { select: { id: true, stock: true, colorHex: true, colorName: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

function orderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price-asc":
      return [{ price: "asc" }];
    case "price-desc":
      return [{ price: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    default:
      return [{ sortOrder: "asc" }, { createdAt: "desc" }];
  }
}

/** Build the `where` once so the grid and its result count can never disagree. */
function buildWhere(f: ShopFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };

  if (f.category) where.category = { slug: f.category };
  if (f.exclusive) where.AND = [EXCLUSIVE_WHERE];
  if (f.brand?.length) where.brand = { slug: { in: f.brand } };
  if (f.gender?.length) where.gender = { in: f.gender };
  if (f.shape?.length) where.shape = { in: f.shape };
  if (f.material?.length) where.material = { in: f.material };
  if (f.frameType?.length) where.frameType = { in: f.frameType as never };

  if (f.minPrice != null || f.maxPrice != null) {
    where.price = {
      ...(f.minPrice != null ? { gte: f.minPrice } : {}),
      ...(f.maxPrice != null ? { lte: f.maxPrice } : {}),
    };
  }

  if (f.q) {
    // MySQL's default collation is case-insensitive, so `contains` is already
    // a case-insensitive match — Prisma's `mode: "insensitive"` is Postgres-only
    // and would throw here.
    where.OR = [
      { name: { contains: f.q } },
      { description: { contains: f.q } },
      { shape: { contains: f.q } },
      { material: { contains: f.q } },
      { brand: { name: { contains: f.q } } },
      { category: { name: { contains: f.q } } },
    ];
  }

  return where;
}

export async function findProducts(f: ShopFilters) {
  const where = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      select: productCardSelect,
      orderBy: orderBy(f.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.product.count({ where }),
  ]);

  return { products, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/**
 * Facets for the shop sidebar.
 *
 * The attribute lists are read from the vocabulary rather than hard-coded, so
 * a shape coined in Uploads becomes a filter the moment a product uses it.
 */
export async function shopFacets() {
  const [categories, brands, vocabulary] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, _count: { select: { products: true } } },
    }),
    db.brand.findMany({
      where: { products: { some: { status: "ACTIVE" } } },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    db.attributeValue.findMany({
      orderBy: [{ usageCount: "desc" }, { label: "asc" }],
      select: { kind: true, label: true },
    }),
  ]);

  const of = (kind: string) =>
    vocabulary.filter((v) => v.kind === kind).map((v) => v.label);

  return {
    categories,
    brands,
    genders: of("GENDER"),
    shapes: of("SHAPE"),
    materials: of("MATERIAL"),
  };
}
