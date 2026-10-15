import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Page links are real <Link>s carrying the current filters, so a crawler can
 * walk the whole catalogue and a shopper can open page 3 in a new tab.
 */
export function Pagination({
  page,
  pageCount,
  searchParams,
}: {
  page: number;
  pageCount: number;
  searchParams: URLSearchParams;
}) {
  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const next = new URLSearchParams(searchParams.toString());
    if (target === 1) next.delete("page");
    else next.set("page", String(target));
    const qs = next.toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  // A window of pages around the current one, so 40 pages don't wrap the row.
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const pages = Array.from({ length: Math.min(5, pageCount) }, (_, i) => start + i);

  return (
    <nav className="mt-16 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && (
        <Link
          href={hrefFor(page - 1)}
          className="flex h-10 w-10 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      )}

      {pages.map((target) => (
        <Link
          key={target}
          href={hrefFor(target)}
          aria-current={target === page ? "page" : undefined}
          className={`label flex h-10 w-10 items-center justify-center border transition-colors ${
            target === page
              ? "border-ink bg-ink text-paper"
              : "border-line text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          {target}
        </Link>
      ))}

      {page < pageCount && (
        <Link
          href={hrefFor(page + 1)}
          className="flex h-10 w-10 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      )}
    </nav>
  );
}
