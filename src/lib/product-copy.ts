import { SETTING_KEYS, type SettingKey } from "@/lib/settings";

export type ProductBlock = { title: string; body: string; isPlaceholder: boolean };

/**
 * The standing blocks every product page carries — authenticity, warranty,
 * shipping and after-sales.
 *
 * Written once in the admin panel rather than per product: these are promises
 * the shop makes about everything it sells, and keeping them on the product
 * would mean editing four hundred of them to change a returns window.
 *
 * The defaults are the site's existing wording, so nothing reads as unwritten
 * before the shop has been near this screen.
 */
const DEFAULTS: Record<string, { title: string; body: string }> = {
  [SETTING_KEYS.productAuthenticity]: {
    title: "Authenticity & Warranty Information",
    body: "Every frame is bought directly from the house or its Indian distributor and arrives with its own papers. We do not sell grey-market stock, and the box, the case and the certificate are handed to you at the counter.\n\nThe brand's own warranty covers manufacturing defects from the date of purchase. Bring the frame and the invoice into any Broadway store and we will handle the claim for you.",
  },
  [SETTING_KEYS.productCare]: {
    title: "Product Care",
    body: "Rinse the lenses under cool water before wiping, so grit is carried off rather than dragged across the coating, and dry them with the cloth in the case — not a shirt. Keep the frame in its case rather than face-down, and leave it out of a parked car; heat is what loosens an acetate front.\n\nBring it in whenever it feels crooked. Adjustment and cleaning are free, for as long as you own it.",
  },
  [SETTING_KEYS.productShipping]: {
    title: "Shipping & Returns Policy",
    body: "Standard delivery takes 5–7 working days; express is ₹500 extra and arrives in 2–3. Unworn frames can be returned within 14 days in their original packaging.\n\nLenses cut to your prescription cannot be returned, which is why we would rather you came in and tried the frame first — or let us bring it to you.",
  },
  [SETTING_KEYS.productAfterSales]: {
    title: "After-Sales Service",
    body: "Free adjustment, nose-pad replacement and ultrasonic cleaning for the life of the frame, at any Broadway store — whether the frame came from us or not.",
  },
};

export function productBlocks(
  settings: Partial<Record<SettingKey, string>>
): ProductBlock[] {
  return Object.entries(DEFAULTS).map(([key, fallback]) => {
    const written = settings[key as SettingKey]?.trim();
    return {
      title: fallback.title,
      body: written || fallback.body,
      isPlaceholder: !written,
    };
  });
}

export const PRODUCT_BLOCK_KEYS = Object.keys(DEFAULTS) as SettingKey[];
export const PRODUCT_BLOCK_TITLES = Object.fromEntries(
  Object.entries(DEFAULTS).map(([key, v]) => [key, v.title])
) as Record<string, string>;
