import { Prisma } from "@prisma/client";

/** A frame is "new" for this long after it is uploaded. */
export const NEW_FOR_DAYS = 15;

/** A sold-out frame stays listed this long, then delists itself. */
export const SOLD_OUT_GRACE_DAYS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

function daysSince(date: Date): number {
  return (Date.now() - new Date(date).getTime()) / DAY_MS;
}

/**
 * Is this frame still new?
 *
 * Driven by the upload date rather than a flag someone has to remember to
 * turn off — a "New" badge that outlives its welcome is worse than none,
 * and nobody ever goes back to clear them by hand.
 */
export function isNew(product: { createdAt: Date }, days: number | undefined = NEW_FOR_DAYS): boolean {
  return daysSince(product.createdAt) <= (days ?? NEW_FOR_DAYS);
}

export function isSoldOut(product: { soldOutAt?: Date | null }): boolean {
  return Boolean(product.soldOutAt);
}

/**
 * The upload date a frame must beat to still count as new.
 *
 * Wrapped in a function rather than computed inline in a page: reading the
 * clock in a component body is a render-purity violation, and the lint rule
 * that catches it is right — the value would differ between renders.
 */
export function newArrivalCutoff(days: number = NEW_FOR_DAYS): Date {
  return new Date(Date.now() - days * DAY_MS);
}

/**
 * Should a sold-out frame still be listed?
 *
 * It keeps its place for a grace period — a shopper who saw it yesterday
 * should find it today, and a frame often comes back into stock — and then
 * disappears on its own.
 */
export function isWithinSoldOutGrace(product: { soldOutAt?: Date | null }): boolean {
  if (!product.soldOutAt) return true;
  return daysSince(product.soldOutAt) <= SOLD_OUT_GRACE_DAYS;
}

/**
 * Products the storefront may show: in stock, or sold out recently enough.
 *
 * Expressed as a `where` rather than filtered after the query, so counts,
 * pagination and the grid can never disagree about what is listed.
 */
export function listableWhere(): Prisma.ProductWhereInput {
  const cutoff = new Date(Date.now() - SOLD_OUT_GRACE_DAYS * DAY_MS);
  return { OR: [{ soldOutAt: null }, { soldOutAt: { gt: cutoff } }] };
}

/** Price is hidden for store-exclusive houses — enquiry only. */
export function isPriceHidden(product: {
  brand?: { isStoreExclusive?: boolean | null } | null;
}): boolean {
  return Boolean(product.brand?.isStoreExclusive);
}
