"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Package, MapPin, User, LogOut } from "lucide-react";

const LINKS = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:sticky lg:top-[124px] lg:self-start">
      {/* Scrolls horizontally on phones rather than stacking four rows above
          the content the shopper actually came for. */}
      <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={`label flex shrink-0 items-center gap-3 whitespace-nowrap border px-5 py-3.5 transition-colors lg:border-0 lg:border-b lg:border-line lg:px-0 ${
                  active
                    ? "border-ink text-ink lg:border-b-ink"
                    : "border-line text-ink-muted hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="label flex w-full shrink-0 items-center gap-3 whitespace-nowrap border border-line px-5 py-3.5 text-clay transition-colors lg:border-0 lg:px-0 lg:pt-5"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  );
}
