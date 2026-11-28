import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { LogoMark } from "@/components/Logo";
import { Instagram, Facebook } from "@/components/Icons";
import type { ShopContact } from "@/lib/contact";

const COLUMNS = [
  {
    heading: "Shop",
    links: [
      { label: "Sunglasses", href: "/shop?category=sunglasses" },
      { label: "Eyeglasses", href: "/shop?category=eyeglasses" },
      { label: "Computer Glasses", href: "/shop?category=computer-glasses" },
      { label: "Contact Lenses", href: "/shop?category=contact-lenses" },
      { label: "Accessories", href: "/shop?category=accessories" },
    ],
  },
  {
    heading: "The House",
    links: [
      { label: "BO Exclusive", href: "/bo-exclusive" },
      { label: "Our Brands", href: "/brands" },
      { label: "Our Story", href: "/about" },
      { label: "Find a Store", href: "/stores" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Broadway at Home", href: "/broadway-at-home" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & Exchange", href: "/returns" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer({ contact }: { contact: ShopContact }) {
  return (
    <footer className="relative mt-24 border-t border-line bg-ink text-paper grain">
      <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand block */}
          <div>
            <LogoMark className="h-6 w-auto text-paper" />
            <p className="display mt-4 text-2xl leading-tight">
              Seen clearly,
              <br />
              <em className="text-brass">since 1974.</em>
            </p>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
              {contact.blurb}
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.heading}>
              <h2 className="label text-brass">{column.heading}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper/65 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="my-12 border-0 h-px bg-paper/15" />

        <div className="grid gap-6 text-sm text-paper/60 sm:grid-cols-2 lg:grid-cols-4">
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            {/* The map link is the address, so the two can never point at
                different places. */}
            {contact.mapsUrl ? (
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-paper"
              >
                {contact.address}
              </a>
            ) : (
              <span>{contact.address}</span>
            )}
          </p>

          <p className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <span>{contact.hours}</span>
          </p>

          <p className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-paper">
              {contact.phone}
            </a>
          </p>

          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <a href={`mailto:${contact.email}`} className="hover:text-paper">
              {contact.email}
            </a>
          </p>
        </div>

        {contact.isPlaceholder && (
          <p className="label mt-7 border border-dashed border-paper/25 px-4 py-3 text-[0.55rem] leading-relaxed text-paper/55">
            Placeholder details. Set the shop&rsquo;s real address, phone, email, opening hours
            and map link in Admin → Homepage → Footer &amp; Shipping.
          </p>
        )}
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-paper/40 sm:flex-row lg:px-10">
          <p>© {new Date().getFullYear()} Broadway Opticals. All rights reserved.</p>
          <p className="label text-[0.6rem]">Crafted in New Delhi</p>
        </div>
      </div>
    </footer>
  );
}
