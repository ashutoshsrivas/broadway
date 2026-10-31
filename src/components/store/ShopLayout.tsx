"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/**
 * Shop page shell: a filter column that starts collapsed.
 *
 * The grid gets the whole width until someone asks for filters, which is what
 * most visitors want — they came to look at frames, not to narrow a list they
 * have not seen yet.
 *
 * The column is rendered at all times and animated to zero width rather than
 * unmounted, so opening it does not re-mount the filter inputs and lose the
 * focus or scroll position inside them.
 */
export function ShopLayout({
  filters,
  activeCount,
  children,
}: {
  filters: React.ReactNode;
  activeCount: number;
  children: React.ReactNode;
}) {
  // Opens by itself when the visitor arrives on a filtered URL — a shared or
  // bookmarked link should show which filters produced it.
  const [open, setOpen] = useState(activeCount > 0);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="label flex items-center gap-2 border border-line px-5 py-3 transition-colors hover:border-ink"
      >
        {open ? (
          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
        ) : (
          <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
        {open ? "Hide Filters" : "Filters"}
        {activeCount > 0 && <span className="text-brass">({activeCount})</span>}
      </button>

      {/* Stacked on a phone — a 15rem column beside the grid would leave the
          cards about a thumb wide — and a real column from lg up. */}
      <div className="mt-9 flex flex-col lg:flex-row">
        <aside
          aria-hidden={!open}
          className={`overflow-hidden transition-all duration-500 ease-out lg:shrink-0 ${
            open
              ? "mb-10 max-h-[200rem] opacity-100 lg:mb-0 lg:mr-14 lg:w-[15rem] lg:max-h-none"
              : "mb-0 max-h-0 opacity-0 lg:w-0"
          }`}
        >
          {/* Fixed inner width from lg up, so the contents do not reflow while
              the column animates shut. */}
          <div className="lg:w-[15rem]">{filters}</div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
