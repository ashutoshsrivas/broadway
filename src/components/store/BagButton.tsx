"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * The bag icon with its count.
 *
 * The count is only rendered after mount. The cart is restored from
 * localStorage, so the server renders 0 and the client would render 3 —
 * painting the badge before hydration produces a React mismatch and a
 * visible flicker.
 */
export function BagButton() {
  const hydrated = useHydrated();
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const setIsOpen = useCartStore((s) => s.setIsOpen);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="relative p-2.5 text-ink-soft transition-colors hover:text-brass"
      aria-label={hydrated && count > 0 ? `Bag, ${count} items` : "Bag"}
    >
      <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brass px-1 font-sans text-[10px] font-medium text-ink">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
