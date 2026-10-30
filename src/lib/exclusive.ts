import { Prisma } from "@prisma/client";
import { SETTING_KEYS } from "@/lib/settings";

/**
 * BO Exclusive — the house selection.
 *
 * A product counts as exclusive if it carries the flag itself OR sits in a
 * department that does. That rule lives here alone: the badge, the product
 * page notice, the listing and the shop filter all ask this module rather
 * than each re-deciding, so marking a category can never light up the badge
 * in one place and not another.
 */
export const EXCLUSIVE_WHERE: Prisma.ProductWhereInput = {
  OR: [{ isBoExclusive: true }, { category: { isBoExclusive: true } }],
};

export function isExclusive(product: {
  isBoExclusive?: boolean | null;
  category?: { isBoExclusive?: boolean | null } | null;
}): boolean {
  return Boolean(product.isBoExclusive || product.category?.isBoExclusive);
}

export type ExclusiveCopy = {
  label: string;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

/**
 * The admin-written copy, with defaults that read as finished rather than as
 * placeholder text — an unconfigured shop still gets a coherent notice.
 */
export function exclusiveCopy(
  settings: Partial<Record<string, string>>
): ExclusiveCopy {
  return {
    label: settings[SETTING_KEYS.exclusiveLabel] || "BO Exclusive",
    title: settings[SETTING_KEYS.exclusiveTitle] || "A Broadway Exclusive",
    message:
      settings[SETTING_KEYS.exclusiveMessage] ||
      "This piece is held exclusively by Broadway Opticals. Numbers are limited and each one is fitted in store by our own opticians — talk to us before you buy and we'll make sure it's right for your face.",
    ctaLabel: settings[SETTING_KEYS.exclusiveCtaLabel] || null,
    ctaHref: settings[SETTING_KEYS.exclusiveCtaHref] || null,
  };
}
