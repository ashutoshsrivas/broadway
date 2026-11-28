import { Suspense } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { fallbackShuffleSeed, findProducts, shopFacets } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopLayout } from "@/components/store/ShopLayout";
import { SortSelect } from "@/components/store/SortSelect";
import { Pagination } from "@/components/store/Pagination";
import { ShopEditorialTile } from "@/components/store/ShopEditorialTile";
import { buildShopGrid, DEFAULT_ROWS_BETWEEN } from "@/lib/shop-grid";
import { SETTING_KEYS, getSettings, settingOn } from "@/lib/settings";
import { ShuffleSeed } from "@/components/store/ShuffleSeed";
import { SHIPPING_COPY } from "@/lib/shipping";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Shop Eyewear",
  description: "Browse sunglasses, eyeglasses and contact lenses from the world's finest houses.",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** searchParams values arrive as `string | string[]`; filters always want a list. */
function asList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function asNumber(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const category = Array.isArray(sp.category) ? sp.category[0] : sp.category;
  const query = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim();

  // Settings are needed before the query, because whether the grid shuffles
  // changes what the query is.
  const settings = await getSettings();

  // The seed is this visit's, from a session cookie. Before the cookie
  // exists — the very first page of a visit — a time bucket stands in, so
  // the first page is still mixed rather than alphabetical by accident.
  const cookieSeed = Number((await cookies()).get("bw_shuffle")?.value);
  const shuffleSeed = settingOn(settings, SETTING_KEYS.shopShuffle)
    ? Number.isFinite(cookieSeed) && cookieSeed > 0
      ? cookieSeed
      : fallbackShuffleSeed()
    : undefined;

  const [{ products, total, page, pageCount }, facets, editorials] = await Promise.all([
    findProducts({
      category,
      q: query,
      brand: asList(sp.brand),
      gender: asList(sp.gender),
      shape: asList(sp.shape),
      material: asList(sp.material),
      colour: asList(sp.colour),
      size: asList(sp.size),
      frameType: asList(sp.frameType),
      minPrice: asNumber(sp.minPrice),
      maxPrice: asNumber(sp.maxPrice),
      exclusive: asList(sp.exclusive).length > 0,
      sale: asList(sp.sale).length > 0,
      sort: Array.isArray(sp.sort) ? sp.sort[0] : sp.sort,
      page: asNumber(sp.page),
      shuffleSeed,
    }),
    shopFacets(),
    db.shopEditorial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, imageUrl: true, eyebrow: true, heading: true, href: true },
    }),
  ]);

  // Interleave the editorial images into the run of products: one every few
  // rows, alternating sides. Only the first page is interleaved — on page four
  // the same handful of images would reappear in the same positions.
  const rowsBetween = Number(settings[SETTING_KEYS.editorialEveryRows]) || DEFAULT_ROWS_BETWEEN;
  const cells = buildShopGrid(products, page === 1 ? editorials : [], rowsBetween);

  const activeCategory = facets.categories.find((c) => c.slug === category);
  const heading = query
    ? `Results for “${query}”`
    : activeCategory?.name ?? "All Eyewear";

  const activeFilterCount =
    ["brand", "gender", "shape", "material", "colour", "size", "frameType"].reduce(
      (sum, key) => sum + asList(sp[key]).length,
      0
    ) +
    (category ? 1 : 0) +
    (sp.minPrice ? 1 : 0);

  // Rebuilt from the resolved params so pagination links carry every filter.
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    for (const item of asList(value)) urlParams.append(key, item);
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-10 lg:px-10 lg:py-14">
      <ShuffleSeed />

      {/* The shop asked that express be visible before checkout, not
          discovered there. */}
      <p className="label mb-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 border border-line bg-paper-raised px-4 py-3 text-[0.6rem] text-ink-muted">
        <span className="text-brass">Delivery</span>
        <span>
          {SHIPPING_COPY.STANDARD.label} {SHIPPING_COPY.STANDARD.days}
        </span>
        <span className="text-line">·</span>
        <span>
          {SHIPPING_COPY.EXPRESS.label} {SHIPPING_COPY.EXPRESS.days}, {SHIPPING_COPY.EXPRESS.note}
        </span>
        <span className="text-line">·</span>
        <span>Choose at checkout</span>
      </p>

      <nav className="label mb-7 flex items-center gap-2 text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="text-brass">/</span>
        <span className="text-ink">{heading}</span>
      </nav>

      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
        <div>
          <h1 className="display text-[clamp(2rem,5vw,3.25rem)]">{heading}</h1>
          <p className="label mt-3 text-ink-muted">
            {total} {total === 1 ? "frame" : "frames"}
          </p>
        </div>

        <Suspense fallback={null}>
          <SortSelect />
        </Suspense>
      </header>

      <Suspense fallback={null}>
        <ShopLayout
          activeCount={activeFilterCount}
          filters={<ShopFilters facets={facets} variant="sidebar" />}
        >
          {products.length === 0 ? (
            <div className="flex flex-col items-center py-24 text-center">
              <p className="display text-3xl">Nothing here — yet.</p>
              <p className="mt-3 max-w-sm text-sm text-ink-soft">
                No frames match this combination. Try widening the price range or clearing a
                filter.
              </p>
              <Link href="/shop" className="btn-ink label mt-8 px-9 py-3.5">
                View All Frames
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 lg:gap-x-7">
                {cells.map((cell, i) =>
                  cell.kind === "product" ? (
                    <li key={cell.product.id}>
                      <ProductCard product={cell.product} priority={i < 6} />
                    </li>
                  ) : (
                    <ShopEditorialTile key={cell.editorial.id} editorial={cell.editorial} />
                  )
                )}
              </ul>
              <Pagination page={page} pageCount={pageCount} searchParams={urlParams} />
            </>
          )}
        </ShopLayout>
      </Suspense>
    </div>
  );
}
