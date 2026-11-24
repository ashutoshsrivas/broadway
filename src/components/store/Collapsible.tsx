"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

/**
 * One row of the accordion under the buy column.
 *
 * Closed by default except the first: the shop asked for the detail to be
 * collapsible precisely so the page does not open as a wall of policy, and a
 * phone screen has room for the frame or the small print, not both.
 */
export function Collapsible({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="label flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-brass"
        >
          {title}
          {open ? (
            <Minus className="h-3.5 w-3.5 shrink-0 text-brass" strokeWidth={2} />
          ) : (
            <Plus className="h-3.5 w-3.5 shrink-0 text-brass" strokeWidth={2} />
          )}
        </button>
      </h3>

      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}
