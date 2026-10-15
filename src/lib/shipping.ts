/**
 * Shipping is a single flat rule, free over a threshold. Two constants beat a
 * shipping-zone table for a store with one warehouse and one country.
 */
export const FREE_SHIPPING_ABOVE = 2000;
export const SHIPPING_FLAT_RATE = 99;

export function shippingFor(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_ABOVE || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
}
