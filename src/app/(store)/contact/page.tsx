import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Talk to a Broadway Opticals optician about frames, lenses or an existing order.",
};

const CHANNELS = [
  {
    icon: Phone,
    label: "Call us",
    value: "+91 11 2341 2345",
    href: "tel:+911123412345",
    note: "Mon–Sat, 10:30–20:00",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98100 12345",
    href: "https://wa.me/919810012345",
    note: "Fastest for order updates",
  },
  {
    icon: Mail,
    label: "Email",
    value: "care@broadwayopticals.com",
    href: "mailto:care@broadwayopticals.com",
    note: "We reply within one working day",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact Us"
        title={
          <>
            Talk to an <em>optician.</em>
          </>
        }
        blurb="Questions about a prescription, a frame fit, or an order already on its way — reach us however suits you."
      />

      <div className="mx-auto max-w-[1500px] px-5 pb-24 lg:px-10">
        <ul className="grid gap-5 md:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, label, value, href, note }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group block h-full border border-line bg-paper-raised p-7 transition-colors hover:border-brass"
              >
                <Icon className="h-6 w-6 text-brass" strokeWidth={1.2} />
                <p className="label mt-5 text-ink-muted">{label}</p>
                <p className="display mt-2 text-xl transition-colors group-hover:text-brass">
                  {value}
                </p>
                <p className="mt-2.5 text-xs text-ink-muted">{note}</p>
              </a>
            </li>
          ))}
        </ul>

        <div className="deco-frame mt-5 border border-line bg-paper-raised p-9">
          <MapPin className="h-6 w-6 text-brass" strokeWidth={1.2} />
          <h2 className="display mt-5 text-2xl">Visit the flagship</h2>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            M-42, Outer Circle, Connaught Place, New Delhi 110001.
            <br />
            Mon–Sat 10:30–20:00 · Sun 11:00–18:00
          </p>
          <Link href="/stores" className="label link-rule mt-6 inline-block text-ink-soft">
            See all six stores →
          </Link>
        </div>
      </div>
    </>
  );
}
