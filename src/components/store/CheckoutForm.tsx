"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import toast from "react-hot-toast";
import { Lock, Banknote, CreditCard } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { shippingFor } from "@/lib/shipping";
import { useHydrated } from "@/lib/use-hydrated";

type Prefill = { name: string; email: string; phone: string };

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutForm({
  prefill,
  onlinePaymentAvailable,
}: {
  prefill: Prefill;
  onlinePaymentAvailable: boolean;
}) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const hydrated = useHydrated();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<"RAZORPAY" | "COD">(
    onlinePaymentAvailable ? "RAZORPAY" : "COD"
  );
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<{ amount: number; percent: number; code: string } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [email, setEmail] = useState(prefill.email);

  // An empty bag has nothing to check out — send them back rather than showing
  // a ₹0 form. Waits for hydration so a restored cart isn't mistaken for empty.
  useEffect(() => {
    if (hydrated && items.length === 0 && !submitting) router.replace("/cart");
  }, [hydrated, items.length, submitting, router]);

  if (!hydrated || items.length === 0) return <div className="h-96" />;

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const discount = promo?.amount ?? 0;
  const total = Math.max(0, subtotal - discount) + shipping;

  /** Ask the server whether this code applies. The answer is advisory —
   *  /api/orders re-checks it when the order is actually created. */
  const applyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;
    if (!email.trim()) {
      setPromoError("Enter your email first — the offer is for first orders.");
      return;
    }

    setCheckingPromo(true);
    setPromoError(null);

    const res = await fetch("/api/promo/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        email: email.trim(),
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setCheckingPromo(false);

    if (!data.ok) {
      setPromo(null);
      setPromoError(data.reason ?? "That code isn't recognised.");
      return;
    }
    setPromo({ amount: data.amount, percent: data.percent, code: data.code });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      line1: String(form.get("line1") ?? ""),
      line2: String(form.get("line2") ?? ""),
      city: String(form.get("city") ?? ""),
      state: String(form.get("state") ?? ""),
      pincode: String(form.get("pincode") ?? ""),
      notes: String(form.get("notes") ?? ""),
      paymentMethod: method,
      promoCode: promo?.code,
      // Only ids and quantities go over the wire; the server prices the bag.
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not place your order.");
        setSubmitting(false);
        return;
      }

      if (method === "COD") {
        clearCart();
        router.push(`/checkout/success?order=${data.orderNumber}`);
        return;
      }

      openRazorpay(data, payload);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const openRazorpay = (
    data: { razorpayOrderId: string; amount: number; keyId: string; orderNumber: string },
    payload: { name: string; email: string; phone: string }
  ) => {
    if (!window.Razorpay) {
      setError("The payment window could not load. Please try again.");
      setSubmitting(false);
      return;
    }

    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.amount,
      currency: "INR",
      name: "Broadway Opticals",
      description: `Order ${data.orderNumber}`,
      order_id: data.razorpayOrderId,
      prefill: { name: payload.name, email: payload.email, contact: payload.phone },
      theme: { color: "#2A1F17" },
      // The browser's word that payment succeeded is not enough — the order is
      // only marked paid once the server verifies the signature.
      handler: async (response: RazorpayResponse) => {
        try {
          const verify = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await verify.json();

          if (!verify.ok) {
            setError(result.error ?? "We could not confirm your payment.");
            setSubmitting(false);
            return;
          }

          clearCart();
          router.push(`/checkout/success?order=${result.orderNumber}`);
        } catch {
          setError("Payment went through but confirmation failed. Please contact us.");
          setSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setSubmitting(false);
          toast("Payment cancelled — your order is still saved as pending.");
        },
      },
    });

    checkout.open();
  };

  return (
    <>
      {onlinePaymentAvailable && (
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      )}

      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div className="space-y-10">
          <section>
            <h2 className="label-lg">Contact</h2>
            <hr className="rule-deco mt-4 mb-6" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field name="name" label="Full name" defaultValue={prefill.name} required />
              <Field name="phone" label="Phone" type="tel" defaultValue={prefill.phone} required />
              <div className="sm:col-span-2">
                <label className="block">
                  <span className="label text-ink-muted">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field mt-1.5"
                  />
                </label>
              </div>
            </div>
          </section>

          <section>
            <h2 className="label-lg">Shipping Address</h2>
            <hr className="rule-deco mt-4 mb-6" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field name="line1" label="Address" required />
              </div>
              <div className="sm:col-span-2">
                <Field name="line2" label="Apartment, landmark (optional)" />
              </div>
              <Field name="city" label="City" required />
              <Field name="state" label="State" required />
              <Field name="pincode" label="PIN code" inputMode="numeric" maxLength={6} required />
            </div>
          </section>

          <section>
            <h2 className="label-lg">Payment</h2>
            <hr className="rule-deco mt-4 mb-6" />
            <div className="space-y-3">
              {onlinePaymentAvailable && (
                <PaymentOption
                  icon={CreditCard}
                  title="Pay Online"
                  note="Card, UPI, net banking or wallet — secured by Razorpay"
                  checked={method === "RAZORPAY"}
                  onChange={() => setMethod("RAZORPAY")}
                />
              )}
              <PaymentOption
                icon={Banknote}
                title="Cash on Delivery"
                note="Pay the courier when your frames arrive"
                checked={method === "COD"}
                onChange={() => setMethod("COD")}
              />
            </div>
          </section>

          <section>
            <h2 className="label-lg">Order Notes</h2>
            <hr className="rule-deco mt-4 mb-6" />
            <textarea
              name="notes"
              rows={3}
              placeholder="Prescription details, delivery instructions…"
              className="field resize-none"
            />
          </section>
        </div>

        {/* ── Summary ── */}
        <aside className="lg:sticky lg:top-[124px] lg:self-start">
          <div className="border border-line bg-paper-raised p-7">
            <h2 className="label-lg">Your Order</h2>
            <hr className="rule-deco my-5" />

            <ul className="mb-5 max-h-72 space-y-4 overflow-y-auto">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3.5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-paper-sunk">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] text-paper">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm">{item.name}</p>
                    <p className="text-xs text-ink-muted">{item.colorName}</p>
                  </div>
                  <span className="shrink-0 text-sm">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {/* ── Offer code ── */}
            <div className="border-t border-line pt-5">
              {promo ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="label text-brass">
                    ◆ {promo.code} — {promo.percent}% off
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPromo(null);
                      setPromoCode("");
                    }}
                    className="label text-ink-muted hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        // Enter here applies the code; it must not submit the
                        // whole order before the discount has been applied.
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyPromo();
                        }
                      }}
                      placeholder="Offer code"
                      className="field-box flex-1 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => void applyPromo()}
                      disabled={checkingPromo || !promoCode.trim()}
                      className="btn-outline label shrink-0 px-5"
                    >
                      {checkingPromo ? "…" : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="mt-2 text-xs text-clay">{promoError}</p>}
                </>
              )}
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-clay">
                  <dt>Offer ({promo?.percent}%)</dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd>
                  {shipping === 0 ? <span className="text-brass">Complimentary</span> : formatPrice(shipping)}
                </dd>
              </div>
            </dl>

            <hr className="rule-deco my-5" />
            <div className="flex items-baseline justify-between">
              <span className="label">Total</span>
              <span className="font-display text-2xl">{formatPrice(total)}</span>
            </div>

            {error && (
              <p className="mt-5 border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-ink label mt-6 flex w-full items-center justify-center gap-2.5 py-4"
            >
              <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              {submitting
                ? "Please wait…"
                : method === "COD"
                  ? "Place Order"
                  : `Pay ${formatPrice(total)}`}
            </button>

            <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
              By placing this order you agree to our{" "}
              <Link href="/terms" className="underline hover:text-ink">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-ink">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Field({
  name,
  label,
  ...props
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label text-ink-muted">{label}</span>
      <input name={name} className="field mt-1.5" {...props} />
    </label>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  note,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  note: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-4 border p-5 transition-colors ${
        checked ? "border-ink bg-paper-raised" : "border-line hover:border-ink-muted"
      }`}
    >
      <input type="radio" name="payment" checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          checked ? "border-brass" : "border-line"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-brass" />}
      </span>
      <Icon className="h-5 w-5 shrink-0 text-ink-soft" strokeWidth={1.3} />
      <span className="min-w-0">
        <span className="label block">{title}</span>
        <span className="mt-1 block text-xs text-ink-muted">{note}</span>
      </span>
    </label>
  );
}
