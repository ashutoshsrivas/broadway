import { SETTING_KEYS, type SettingKey } from "@/lib/settings";

export type ShopContact = {
  blurb: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapsUrl: string | null;
  instagram: string;
  facebook: string;
  /** True while any of the details are still our stand-ins. */
  isPlaceholder: boolean;
};

/**
 * The shop's own details, from the admin panel.
 *
 * The defaults are plainly marked as placeholders where they would otherwise
 * be mistaken for real contact details — an address and a phone number are
 * exactly the sort of invented copy that ends up printed on something.
 */
const PLACEHOLDER_ADDRESS = "Address to be confirmed — set it in the admin panel";
const PLACEHOLDER_PHONE = "Phone to be confirmed";
const PLACEHOLDER_EMAIL = "care@example.com";

export function getContact(settings: Partial<Record<SettingKey, string>>): ShopContact {
  const address = settings[SETTING_KEYS.footerAddress]?.trim();
  const phone = settings[SETTING_KEYS.footerPhone]?.trim();
  const email = settings[SETTING_KEYS.footerEmail]?.trim();

  return {
    blurb:
      settings[SETTING_KEYS.footerBlurb]?.trim() ||
      "Five decades of precision lens craft and the world's finest frames.",
    address: address || PLACEHOLDER_ADDRESS,
    phone: phone || PLACEHOLDER_PHONE,
    email: email || PLACEHOLDER_EMAIL,
    hours: settings[SETTING_KEYS.footerHours]?.trim() || "Open 7 days a week · 10am – 8pm",
    mapsUrl: settings[SETTING_KEYS.footerMapsUrl]?.trim() || null,
    instagram: settings[SETTING_KEYS.footerInstagram]?.trim() || "https://instagram.com",
    facebook: settings[SETTING_KEYS.footerFacebook]?.trim() || "https://facebook.com",
    isPlaceholder: !address || !phone || !email,
  };
}

export type ShippingTerms = {
  regular: string;
  expressCost: string | null;
  expressTime: string | null;
  freeAbove: string | null;
  expressIsPlaceholder: boolean;
};

export function getShipping(settings: Partial<Record<SettingKey, string>>): ShippingTerms {
  const expressCost = settings[SETTING_KEYS.shippingExpressCost]?.trim();
  const expressTime = settings[SETTING_KEYS.shippingExpressTime]?.trim();

  return {
    regular: settings[SETTING_KEYS.shippingRegular]?.trim() || "5–7 working days",
    expressCost: expressCost || null,
    expressTime: expressTime || null,
    freeAbove: settings[SETTING_KEYS.shippingFreeAbove]?.trim() || "₹2,000",
    // Express is offered but the price and the promise are the shop's to
    // give. Until both are set the page says so rather than inventing them.
    expressIsPlaceholder: !expressCost || !expressTime,
  };
}
