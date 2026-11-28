"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SETTING_KEYS } from "@/lib/settings";

type Settings = Partial<Record<string, string>>;

/**
 * The shop's own details, and the shipping promise.
 *
 * Everything here is blank until the shop fills it in, and the storefront
 * says so rather than showing an invented address — the one kind of
 * placeholder that ends up printed on something.
 */
export function FooterSettings({ settings }: { settings: Settings }) {
  const router = useRouter();

  const save = async (key: string, value: string) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      toast.error("Could not save.");
      router.refresh();
      return;
    }
    toast.success("Saved");
    router.refresh();
  };

  const field = (key: string, label: string, hint: string, rows = 0) => {
    const current = settings[key] ?? "";
    const props = {
      defaultValue: current,
      placeholder: hint,
      className: `field-box mt-1.5 !text-xs${rows ? " resize-y" : ""}`,
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value.trim();
        if (value !== current) void save(key, value);
      },
    };
    return (
      <label key={key} className="block">
        <span className="label text-ink-muted">{label}</span>
        {rows ? <textarea {...props} rows={rows} /> : <input {...props} />}
      </label>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border border-line bg-paper-raised p-5">
        <h3 className="label">Footer</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {field(SETTING_KEYS.footerAddress, "Address", "M-42, Outer Circle, Connaught Place…", 2)}
          {field(SETTING_KEYS.footerHours, "Opening hours", "Open 7 days a week · 10am – 8pm")}
          {field(SETTING_KEYS.footerPhone, "Phone", "+91 135 2632280")}
          {field(SETTING_KEYS.footerPhoneAlt, "Second phone", "+91 99999 72580")}
          {field(SETTING_KEYS.footerEmail, "Email", "care@broadwayopticals.com")}
          {field(SETTING_KEYS.footerMapsUrl, "Google Maps link", "https://maps.app.goo.gl/…")}
          {field(SETTING_KEYS.footerInstagram, "Instagram", "https://instagram.com/…")}
          {field(SETTING_KEYS.footerFacebook, "Facebook", "https://facebook.com/…")}
          <div className="lg:col-span-2">
            {field(
              SETTING_KEYS.footerAbout,
              "About Us — the footer paragraphs",
              "Founded in 1960… (a blank line starts a new paragraph)",
              5
            )}
          </div>
        </div>
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
          Until the address, phone and email are all filled in, the footer carries a notice saying
          the details are placeholders — so nobody copies an invented address onto a card.
        </p>
      </div>

      <div className="border border-line bg-paper-raised p-5">
        <h3 className="label">Shipping</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {field(SETTING_KEYS.shippingRegular, "Regular delivery time", "5–7 working days")}
          {field(SETTING_KEYS.shippingFreeAbove, "Free above", "₹2,000")}
          {field(SETTING_KEYS.shippingExpressCost, "Express cost", "₹299")}
          {field(SETTING_KEYS.shippingExpressTime, "Express delivery time", "2–3 working days")}
        </div>
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
          The shipping page says express is available but still being quoted until both express
          fields are filled in.
        </p>
      </div>
    </div>
  );
}
