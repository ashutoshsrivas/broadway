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
    title: "Authenticity",
    body: "Every frame is bought directly from the house or its Indian distributor and arrives with its own papers. We do not sell grey-market stock, and we will put the box, the case and the certificate in your hands at the counter.",
  },
  [SETTING_KEYS.productWarranty]: {
    title: "Warranty",
    body: "Covered by the brand's own warranty against manufacturing defects from the date of purchase. Bring the frame and the invoice into any Broadway store and we handle the claim for you.",
  },
  [SETTING_KEYS.productShipping]: {
    title: "Shipping & returns",
    body: "Regular shipping takes 5–7 working days. Unworn frames can be returned within 14 days in their original packaging; lenses cut to your prescription cannot be returned, which is why we would rather you came in to try the frame first.",
  },
  [SETTING_KEYS.productAfterSales]: {
    title: "After-sales",
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
