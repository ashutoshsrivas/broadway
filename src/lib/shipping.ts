/**
 * Shipping is a single flat rule, free over a threshold. Two constants beat a
 * shipping-zone table for a store with one warehouse and one country.
 */
export const FREE_SHIPPING_ABOVE = 2000;
export const SHIPPING_FLAT_RATE = 99;

/** What express costs on top of whatever standard would have been. */
export const EXPRESS_SURCHARGE = 500;

export const SHIPPING_METHODS = ["STANDARD", "EXPRESS"] as const;
export type ShippingMethod = (typeof SHIPPING_METHODS)[number];

export const SHIPPING_COPY: Record<
  ShippingMethod,
  { label: string; days: string; note: string }
> = {
  STANDARD: {
    label: "Standard",
    days: "5–7 working days",
    note: `Free over ₹${FREE_SHIPPING_ABOVE.toLocaleString("en-IN")}, otherwise ₹${SHIPPING_FLAT_RATE}`,
  },
  EXPRESS: {
    label: "Express",
    days: "2–3 working days",
    note: `₹${EXPRESS_SURCHARGE} on top of standard`,
  },
};

/** Narrow whatever arrived on the wire to a method we actually offer. */
export function asShippingMethod(value: unknown): ShippingMethod {
  return value === "EXPRESS" ? "EXPRESS" : "STANDARD";
}

/**
 * What to charge for delivery.
 *
 * Express is a surcharge on the standard cost rather than a flat price of its
 * own, so an order already over the free-shipping threshold pays only the
 * ₹500 — which is what "express shipping will be 500 rupees extra" means.
 */
export function shippingFor(subtotal: number, method: ShippingMethod = "STANDARD"): number {
  const base = subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  if (subtotal === 0) return 0;
  return method === "EXPRESS" ? base + EXPRESS_SURCHARGE : base;
}
