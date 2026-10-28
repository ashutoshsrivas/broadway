/** Fallback used when the shop has not set a number in the admin panel. */
const DEFAULT_NUMBER = "919810012345";

/**
 * A wa.me link with the enquiry already written.
 *
 * Used by brands we list but do not stock: rather than a dead tile or a page
 * with nothing on it, the shopper is handed straight to someone who can tell
 * them whether we can order it in.
 */
export function brandEnquiryLink(brandName: string, number?: string | null): string {
  // wa.me wants digits only — no +, spaces or dashes.
  const digits = (number || DEFAULT_NUMBER).replace(/\D/g, "");
  const text = `Hi Broadway Opticals — do you carry ${brandName}? I'd like to enquire about their frames.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
