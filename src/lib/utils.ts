import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Money, to the rupee, always rounded up.
 *
 * The shop does not deal in paise, and rounding up rather than to-nearest
 * means a displayed price is never below what is actually charged. Applied
 * here AND in the pricing on the server, so the two cannot drift: formatting
 * alone would show ₹20,001 while the gateway took ₹20,000.50.
 */
export function toRupees(amount: number): number {
  return Math.ceil(amount);
}

/** ₹1,23,456 — Indian digit grouping, whole rupees. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toRupees(amount));
}

/** Whole-percent saving of `price` against `mrp`. 0 when there is no saving. */
export function discountPct(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "CAT_EYE" → "Cat Eye". Used for every enum rendered to a shopper. */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
