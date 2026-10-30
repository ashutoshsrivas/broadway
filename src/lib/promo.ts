import { db } from "@/lib/db";
import { SETTING_KEYS, getSettings } from "@/lib/settings";

export type Promo = {
  enabled: boolean;
  percent: number;
  code: string;
  heading: string;
  message: string;
  delayMs: number;
};

/** The cookie that remembers a visitor has already been shown the offer. */
export const PROMO_COOKIE = "bo_welcome_seen";

export function readPromo(settings: Partial<Record<string, string>>): Promo {
  const percent = Number(settings[SETTING_KEYS.promoPercent]);
  const delay = Number(settings[SETTING_KEYS.promoDelay]);

  return {
    enabled: settings[SETTING_KEYS.promoEnabled] === "1",
    // Clamped rather than trusted: a stray "500" in the settings table would
    // otherwise hand every first-time buyer the catalogue for nothing.
    percent: Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 50) : 10,
    code: (settings[SETTING_KEYS.promoCode] || "WELCOME10").trim().toUpperCase(),
    heading: settings[SETTING_KEYS.promoHeading] || "Welcome to Broadway",
    message:
      settings[SETTING_KEYS.promoMessage] ||
      "Take {percent}% off your first order. Use the code below at checkout — our opticians will still fit whatever you choose.",
    delayMs: Number.isFinite(delay) ? Math.min(Math.max(delay, 0), 60) * 1000 : 6000,
  };
}

export async function getPromo(): Promise<Promo> {
  return readPromo(await getSettings());
}

export type PromoCheck =
  | { ok: true; percent: number; amount: number; code: string }
  | { ok: false; reason: string };

/**
 * Validate a code against the configured offer for a given shopper.
 *
 * Both halves matter. The code has to match, and the order has to actually be
 * that person's first — otherwise "10% off your first order" is 10% off
 * forever for anyone who kept the code, which is a standing discount nobody
 * decided to give.
 *
 * Keyed on email rather than account, because checkout allows guests and a
 * returning guest would otherwise get the welcome price every time.
 */
export async function checkPromo(
  rawCode: string,
  email: string,
  subtotal: number
): Promise<PromoCheck> {
  const promo = await getPromo();
  const code = rawCode.trim().toUpperCase();

  if (!promo.enabled) return { ok: false, reason: "That code is not available." };
  if (!code) return { ok: false, reason: "Enter a code." };
  if (code !== promo.code) return { ok: false, reason: "That code isn't recognised." };

  const previous = await db.order.count({
    where: {
      email: email.trim().toLowerCase(),
      // A cancelled order never completed, so it shouldn't burn the offer.
      status: { not: "CANCELLED" },
    },
  });
  if (previous > 0) {
    return { ok: false, reason: "This code is for first orders only." };
  }

  // Rounded to whole rupees so the total a shopper is quoted is the total they
  // are charged — a fractional paisa here reappears as a mismatch at the
  // payment gateway.
  const amount = Math.round((subtotal * promo.percent) / 100);
  return { ok: true, percent: promo.percent, amount, code };
}
