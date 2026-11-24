import { SETTING_KEYS, settingOn, type SettingKey } from "@/lib/settings";

export type HomeServiceContent = {
  enabled: boolean;
  eyebrow: string;
  heading: string;
  blurb: string;
  cities: string[];
  imageUrl: string | null;
  phone: string | null;
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
  const cities = (settings[SETTING_KEYS.homeServiceCities] ?? "Dehradun, Rishikesh, Haridwar")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const heading = settings[SETTING_KEYS.homeServiceHeading]?.trim();
  const blurb = settings[SETTING_KEYS.homeServiceBlurb]?.trim();
  const body = settings[SETTING_KEYS.homeServiceBody]?.trim();

  return {
    enabled: settingOn(settings, SETTING_KEYS.homeServiceEnabled),
    eyebrow: settings[SETTING_KEYS.homeServiceEyebrow]?.trim() || "Home Service",
    heading: heading || "An eye test at your dining table.",
    blurb:
      blurb ||
      "Our optician comes to you with the trial set, the frame tray and the equipment — the same examination you would get in store, in your own light.",
    cities,
    imageUrl: settings[SETTING_KEYS.homeServiceImage]?.trim() || null,
    phone: settings[SETTING_KEYS.homeServicePhone]?.trim() || null,
    body:
      body ||
      "Placeholder copy. Replace this from Admin → Homepage → Home Service with the wording from the current website.",
    isPlaceholder: !heading && !blurb && !body,
  };
}
