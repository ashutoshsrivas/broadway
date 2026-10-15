import crypto from "crypto";
import Razorpay from "razorpay";

/**
 * Razorpay is optional. With no keys configured the store still works — the
 * checkout just offers Cash on Delivery only, rather than showing an online
 * option that would fail at the gateway.
 */
export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

let client: Razorpay | null = null;

export function razorpay(): Razorpay {
  if (!isRazorpayConfigured()) {
    throw new Error("Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
  }
  client ??= new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
  return client;
}

/**
 * Verify the checkout handshake: Razorpay signs `order_id|payment_id` with the
 * key secret. Anything that does not match is treated as unpaid — the browser
 * is never believed about whether money moved.
 *
 * Compared with `timingSafeEqual` so a wrong signature leaks no information
 * through response timing.
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(params.signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
