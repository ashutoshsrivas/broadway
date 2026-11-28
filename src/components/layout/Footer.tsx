import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Instagram, Facebook } from "@/components/Icons";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import type { ShopContact } from "@/lib/contact";

/** The policy pages, as the shop lists them. */
const CUSTOMER_SERVICES = [
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Product Authenticity", href: "/about" },
  { label: "Product Warranty", href: "/returns" },
  { label: "Return Policy", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
];

const SHOP_LINKS = [
  { label: "Sunglasses", href: "/shop?category=sunglasses" },
  { label: "Optical Frames", href: "/shop?category=eyeglasses" },
  { label: "Shop by Brand", href: "/shop-by-brand" },
  { label: "Our Brands", href: "/brands" },
  { label: "Broadway at Home", href: "/broadway-at-home" },
  { label: "Gift Cards", href: "/gift-cards" },
];

/**
 * The footer, in the four columns the shop uses on its own site: who they
 * are, what they promise, how to reach them, and the newsletter.
 *
 * Everything in the contact column comes from the admin panel, so a change
 * of hours or a new number is a field rather than a deploy.
 */
export function Footer({ contact }: { contact: ShopContact }) {
  return (
    <footer className="relative mt-24 border-t border-line bg-ink text-paper grain">
      <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1fr] lg:gap-10">
          {/* ── About ── */}
          <div>
            <LogoMark className="h-6 w-auto text-paper" />
            <h2 className="label mt-6 text-brass">About Us</h2>
            <div className="mt-5 max-w-sm space-y-4 text-sm leading-relaxed text-paper/65">
              {contact.about.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* ── Customer services ── */}
          <nav>
            <h2 className="label text-brass">Customer Services</h2>
            <ul className="mt-5 space-y-3">
              {CUSTOMER_SERVICES.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/65 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="label mt-9 text-brass">Shop</h2>
            <ul className="mt-5 space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
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

          {/* ── Contact ── */}
          <div>
            <h2 className="label text-brass">Contact Us</h2>
            <address className="mt-5 space-y-4 text-sm not-italic leading-relaxed text-paper/65">
              <p>{contact.address}</p>

              <p>
                <a
                  href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                  className="transition-colors hover:text-paper"
                >
                  {contact.phone}
                </a>
              </p>

              {contact.phoneAlt && (
                <p>
                  <a
                    href={`tel:${contact.phoneAlt.replace(/[^\d+]/g, "")}`}
                    className="transition-colors hover:text-paper"
                  >
                    {contact.phoneAlt}
                  </a>
                </p>
              )}

              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors hover:text-paper"
                >
                  {contact.email}
                </a>
              </p>

              <p className="whitespace-pre-line">{contact.hours}</p>
            </address>

            {contact.mapsUrl && (
              <a
                href={contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="label-lg mt-7 inline-block text-paper transition-colors hover:text-brass"
              >
                Google Map
              </a>
            )}

            <div className="mt-7 flex gap-3">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* ── Newsletter ── */}
          <div>
            <h2 className="label text-brass">Keep in Touch</h2>
            <p className="mt-5 text-sm leading-relaxed text-paper/60">
              New arrivals and the occasional word from the counter. No more than that.
            </p>
            <NewsletterForm email={contact.email} />
          </div>
        </div>

        {contact.isPlaceholder && (
          <p className="label mt-12 border border-dashed border-paper/25 px-4 py-3 text-[0.55rem] leading-relaxed text-paper/55">
            Placeholder details. Set the shop&rsquo;s real address, phone, email, opening hours
            and map link in Admin → Homepage → Footer &amp; Shipping.
          </p>
        )}
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-paper/40 sm:flex-row lg:px-10">
          <p className="label text-[0.6rem]">© Broadway Opticians</p>
          <p className="label text-[0.6rem]">Crafted in New Delhi</p>
        </div>
      </div>
    </footer>
  );
}
