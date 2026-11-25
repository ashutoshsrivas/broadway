import { db } from "@/lib/db";

/**
 * Homepage settings, as a typed front door onto the StoreSetting table.
 *
 * Keys live here rather than being typed as strings at each call site, so a
 * rename is one edit and a typo is a compile error instead of a silently
 * missing section.
 */
export const SETTING_KEYS = {
  mustHaveProductId: "homepage.mustHave.productId",
  mustHaveHeading: "homepage.mustHave.heading",
  introducingBrandId: "homepage.introducing.brandId",
  introducingEyebrow: "homepage.introducing.eyebrow",
  instagramHandle: "homepage.instagram.handle",
  instagramUrl: "homepage.instagram.url",
  instagramHeading: "homepage.instagram.heading",
  whatsappNumber: "shop.whatsapp",
  editorialEveryRows: "shop.editorial.everyRows",
  exclusiveLabel: "exclusive.label",
  exclusiveTitle: "exclusive.title",
  exclusiveMessage: "exclusive.message",
  exclusiveCtaLabel: "exclusive.ctaLabel",
  exclusiveCtaHref: "exclusive.ctaHref",
  promoEnabled: "promo.enabled",
  promoPercent: "promo.percent",
  promoCode: "promo.code",
  promoHeading: "promo.heading",
  promoMessage: "promo.message",
  promoDelay: "promo.delaySeconds",

  // ── The hero ──
  /** "lookbook" — the index-and-watermark deck. "deck" — plain full-bleed. */
  heroStyle: "homepage.hero.style",
  /** The line above the whole deck, e.g. "The Lookbook · Six Houses". */
  heroEyebrow: "homepage.hero.eyebrow",

  // ── Homepage behaviour ──
  /** How long a frame stays in New on the Rack, in days. */
  newArrivalsDays: "homepage.newArrivals.days",
  /** "hidden" — no category boxes at all. "hover" — revealed on hover. */
  categoryBoxesMode: "homepage.categoryBoxes.mode",
  /** How many products a homepage grid shows on a phone before "See more". */
  mobileGridCount: "homepage.mobileGridCount",

  // ── The marquee strip above the header ──
  announcementEnabled: "announcement.enabled",
  announcementNotices: "announcement.notices",

  // ── Home service (Dehradun, Rishikesh, Haridwar) ──
  homeServiceEnabled: "homeService.enabled",
  homeServiceEyebrow: "homeService.eyebrow",
  homeServiceHeading: "homeService.heading",
  homeServiceBlurb: "homeService.blurb",
  homeServiceCities: "homeService.cities",
  homeServiceImage: "homeService.imageUrl",
  homeServicePhone: "homeService.phone",
  homeServiceBody: "homeService.body",

  // ── The collapsible blocks on every product page ──
  productAuthenticity: "product.authenticity",
  productWarranty: "product.warranty",
  productShipping: "product.shipping",
  productAfterSales: "product.afterSales",
  productAssistHeading: "product.assist.heading",
  productAssistNote: "product.assist.note",

  /** Mix the shop grid so one house does not lead every page. */
  shopShuffle: "shop.shuffle",

  // ── Footer: the shop's own details ──
  footerBlurb: "footer.blurb",
  footerAddress: "footer.address",
  footerPhone: "footer.phone",
  footerEmail: "footer.email",
  footerHours: "footer.hours",
  footerMapsUrl: "footer.mapsUrl",
  footerInstagram: "footer.instagram",
  footerFacebook: "footer.facebook",

  // ── Shipping ──
  shippingRegular: "shipping.regular",
  shippingExpressCost: "shipping.expressCost",
  shippingExpressTime: "shipping.expressTime",
  shippingFreeAbove: "shipping.freeAbove",
} as const;

/**
 * Defaults, so a store with an empty settings table behaves the way the shop
 * asked for rather than the way the code happens to fall back.
 */
export const SETTING_DEFAULTS: Partial<Record<SettingKey, string>> = {
  "homepage.hero.style": "lookbook",
  "homepage.newArrivals.days": "15",
  "homepage.categoryBoxes.mode": "hidden",
  "homepage.mobileGridCount": "6",
  "announcement.enabled": "1",
  "shop.shuffle": "1",
};

/** A whole number from settings, falling back to the default then to `or`. */
export function settingInt(
  settings: Partial<Record<SettingKey, string>>,
  key: SettingKey,
  or: number
): number {
  const raw = settings[key] ?? SETTING_DEFAULTS[key];
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : or;
}

/** A switch. Absent means "use the default", which may itself be on. */
export function settingOn(
  settings: Partial<Record<SettingKey, string>>,
  key: SettingKey
): boolean {
  const raw = settings[key] ?? SETTING_DEFAULTS[key];
  return raw === "1" || raw === "true";
}

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** Read every setting in one query, as a plain object. */
export async function getSettings(): Promise<Partial<Record<SettingKey, string>>> {
  const rows = await db.storeSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Partial<
    Record<SettingKey, string>
  >;
}

/** Upsert a batch. An empty value deletes the row, so "unset" is a real state. */
export async function putSettings(entries: Record<string, string>): Promise<void> {
  const keys = Object.values(SETTING_KEYS) as string[];

  await Promise.all(
    Object.entries(entries)
      .filter(([key]) => keys.includes(key))
      .map(([key, value]) =>
        value.trim()
          ? db.storeSetting.upsert({
              where: { key },
              update: { value: value.trim() },
              create: { key, value: value.trim() },
            })
          : db.storeSetting.deleteMany({ where: { key } })
      )
  );
}
