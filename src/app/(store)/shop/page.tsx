import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { findProducts, shopFacets } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { SortSelect } from "@/components/store/SortSelect";
import { Pagination } from "@/components/store/Pagination";

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

  const [{ products, total, page, pageCount }, facets] = await Promise.all([
    findProducts({
      category,
      q: query,
      brand: asList(sp.brand),
      gender: asList(sp.gender),
      shape: asList(sp.shape),
      material: asList(sp.material),
      frameType: asList(sp.frameType),
      minPrice: asNumber(sp.minPrice),
      maxPrice: asNumber(sp.maxPrice),
      sort: Array.isArray(sp.sort) ? sp.sort[0] : sp.sort,
      page: asNumber(sp.page),
    }),
    shopFacets(),
  ]);

  const activeCategory = facets.categories.find((c) => c.slug === category);
  const heading = query
    ? `Results for “${query}”`
    : activeCategory?.name ?? "All Eyewear";

  // Rebuilt from the resolved params so pagination links carry every filter.
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    for (const item of asList(value)) urlParams.append(key, item);
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-10 lg:px-10 lg:py-14">
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

        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <Suspense fallback={null}>
              <ShopFilters facets={facets} variant="bar" />
            </Suspense>
          </div>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>
      </header>

      <div className="grid gap-10 pt-9 lg:grid-cols-[230px_1fr] lg:gap-14">
        {/* Same filter component as the mobile drawer above, in its always-open
            desktop presentation. */}
        <div className="hidden lg:block">
          <Suspense fallback={null}>
            <ShopFilters facets={facets} variant="sidebar" />
          </Suspense>
        </div>

        <div>
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
                {products.map((product, i) => (
                  <li key={product.id}>
                    <ProductCard product={product} priority={i < 6} />
                  </li>
                ))}
              </ul>
              <Pagination page={page} pageCount={pageCount} searchParams={urlParams} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
