import { SETTING_KEYS, settingOn, type SettingKey } from "@/lib/settings";

export type HomeServiceContent = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  blurb: string;
  cities: string[];
  imageUrl: string | null;
  heroImageUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  body: string;
  /** True while the shop is still running on our stand-in copy. */
  isPlaceholder: boolean;
};

/**
 * The home-service section, as the shop has written it — or as a clearly
 * labelled stand-in until they send their own words.
 *
 * The placeholder is marked as such on the page rather than passed off as
 * finished copy, so nobody mistakes our guess for the shop's offer.
 */
export function getHomeService(
  settings: Partial<Record<SettingKey, string>>
): HomeServiceContent {
  const cities = (settings[SETTING_KEYS.homeServiceCities] ?? "Dehradun, Haridwar, Rishikesh, Mussoorie")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const heading = settings[SETTING_KEYS.homeServiceHeading]?.trim();
  const blurb = settings[SETTING_KEYS.homeServiceBlurb]?.trim();
  const body = settings[SETTING_KEYS.homeServiceBody]?.trim();

  return {
    enabled: settingOn(settings, SETTING_KEYS.homeServiceEnabled),
    eyebrow: settings[SETTING_KEYS.homeServiceEyebrow]?.trim() || "Broadway at Home",
    heading: heading || "The shop comes to you.",
    blurb:
      blurb ||
      "An optometrist and one of our team arrive with the season's frames and the testing kit, so you can try them on at your own mirror, in your own light.",
    cities,
    imageUrl: settings[SETTING_KEYS.homeServiceImage]?.trim() || null,
    heroImageUrl: settings[SETTING_KEYS.homeServiceHeroImage]?.trim() || null,
    phone: settings[SETTING_KEYS.homeServicePhone]?.trim() || null,
    whatsapp: settings[SETTING_KEYS.homeServiceWhatsapp]?.trim() || null,
    body:
      body ||
      "Placeholder copy. Replace this from Admin → Homepage → Home Service with the wording from the current website.",
    isPlaceholder: !heading && !blurb && !body,
  };
}
