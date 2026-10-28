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
} as const;

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
