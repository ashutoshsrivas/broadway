import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { LogoMark } from "@/components/Logo";

// Drawn inline: lucide dropped its brand glyphs, and two 24px paths are not
// worth another dependency.
function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M14.5 8.5h2.5V5.2h-2.6c-2.3 0-3.7 1.5-3.7 3.9v2.1H8.4v3.3h2.3V21h3.4v-6.5h2.4l.4-3.3h-2.8V9.5c0-.7.3-1 .9-1Z" />
    </svg>
  );
}

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
      { label: "Our Story", href: "/about" },
      { label: "Find a Store", href: "/stores" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns & Exchange", href: "/returns" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

export function Footer() {
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
              Five decades of precision lens craft and the world&rsquo;s finest frames, from our
              first counter in Connaught Place to yours.
            </p>

            <div className="mt-7 flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="border border-paper/20 p-2.5 transition-colors hover:border-brass hover:text-brass"
              >
                <FacebookIcon className="h-4 w-4" />
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

        <div className="grid gap-6 text-sm text-paper/60 sm:grid-cols-3">
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <span>M-42, Outer Circle, Connaught Place, New Delhi 110001</span>
          </p>
          <p className="flex items-center gap-3">
            <Phone className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <a href="tel:+911123412345" className="hover:text-paper">
              +91 11 2341 2345
            </a>
          </p>
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.5} />
            <a href="mailto:care@broadwayopticals.com" className="hover:text-paper">
              care@broadwayopticals.com
            </a>
          </p>
        </div>
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
