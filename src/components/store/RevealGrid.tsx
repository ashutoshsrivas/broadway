"use client";

import { Children, useState } from "react";

/**
 * A product grid that shows a few cards on a phone and the rest behind a
 * button.
 *
 * Only the phone is capped. From `md` up every card is in the grid from the
 * start — a "see more" on a wide screen hides stock the shopper could have
 * taken in at a glance. The overflow cards are rendered either way and merely
 * hidden with a class, so there is no hydration mismatch and no second render
 * pass when the button is pressed.
 */
export function RevealGrid({
  limit,
  children,
  moreLabel = "See more",
}: {
  limit: number;
  children: React.ReactNode;
  moreLabel?: string;
}) {
  const items = Children.toArray(children);
  const [open, setOpen] = useState(false);
  const hiddenCount = Math.max(0, items.length - limit);

  return (
    <>
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
        {items.map((child, i) => (
          <li
            key={i}
            className={i >= limit && !open ? "hidden md:block" : undefined}
          >
            {child}
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && !open && (
        <div className="mt-9 text-center md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-outline label px-10 py-3.5"
          >
            {moreLabel} ({hiddenCount})
          </button>
        </div>
      )}
    </>
  );
}
