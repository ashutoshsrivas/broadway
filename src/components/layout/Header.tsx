"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Search, User, Menu, X, ChevronRight } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { LogoMark } from "@/components/Logo";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { BagButton } from "@/components/store/BagButton";

type NavCategory = { name: string; slug: string };

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const AUDIENCES = [
  { label: "Men", href: "/shop?gender=MEN" },
  { label: "Women", href: "/shop?gender=WOMEN" },
  { label: "Kids", href: "/shop?gender=KIDS" },
];

export function Header({ categories }: { categories: NavCategory[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerRoute, setDrawerRoute] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  // The header sits tall on the hero at rest and tightens once the page moves,
  // so the marquee row doesn't eat a third of a phone screen while scrolling.
  // Subscribed rather than stored in state: the scroll position is external,
  // and this reads it without a render cascade on mount.
  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > 24,
    () => false // the server has no scroll position; start untightened
  );

  // Any navigation closes the drawer — otherwise it stays open over the page
  // the shopper just asked for. Adjusted during render rather than in an
  // effect: React re-runs this component immediately and never commits the
  // intermediate "open on the new route" frame, so the drawer cannot flash.
  if (mobileOpen && drawerRoute !== null && drawerRoute !== pathname) {
    setMobileOpen(false);
    setDrawerRoute(null);
  }

  return (
    <>
      {/* Sticky, not fixed: the announcement marquee sits above it in normal
          flow and scrolls away, while the header itself stays put. Fixed
          positioning would lift the header over the marquee and hide it. */}
      <header className="sticky top-0 z-50">
        <div
          className={`border-b border-line bg-paper/95 backdrop-blur-sm transition-all duration-300 ${
            scrolled ? "py-0" : "py-1.5"
          }`}
        >
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 lg:px-10">
            {/* Left — desktop nav, mobile menu toggle */}
            <div className="flex flex-1 items-center gap-7">
              <button
                onClick={() => {
                  setDrawerRoute(pathname);
                  setMobileOpen(true);
                }}
                className="-ml-2 p-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <nav className="hidden items-center gap-7 lg:flex">
                {AUDIENCES.map((item) => (
                  <Link key={item.label} href={item.href} className="label link-rule py-1 text-ink-soft">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Centre — wordmark */}
            <Link
              href="/"
              className={`flex shrink-0 flex-col items-center transition-all duration-300 ${
                scrolled ? "py-2.5" : "py-4"
              }`}
              aria-label="Broadway Opticals, home"
            >
              <LogoMark className={`w-auto text-ink transition-all ${scrolled ? "h-4" : "h-5"}`} />
              <span
                className={`display mt-1.5 leading-none tracking-[0.06em] transition-all ${
                  scrolled ? "text-base" : "text-lg md:text-xl"
                }`}
              >
                BROADWAY
              </span>
              <span className="label mt-1 text-[0.5rem] text-brass">Opticals</span>
            </Link>

            {/* Right — utilities */}
            <div className="flex flex-1 items-center justify-end gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-ink-soft transition-colors hover:text-brass"
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>

              <Link
                href={session?.user ? "/account" : "/auth/login"}
                className="hidden p-2.5 text-ink-soft transition-colors hover:text-brass sm:block"
                aria-label={session?.user ? "My account" : "Sign in"}
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </Link>

              <BagButton />
            </div>
          </div>
        </div>

        {/* Category rail — the actual shopping nav, kept on its own rule so the
            brand row stays uncluttered. */}
        <div className="hidden border-b border-line bg-paper-raised/95 backdrop-blur-sm lg:block">
          <nav className="mx-auto flex max-w-[1500px] items-center justify-center gap-10 px-10 py-2.5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                className="label link-rule text-ink-soft transition-colors hover:text-ink"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/shop?sale=1" className="label link-rule text-clay">
              Sale
            </Link>
          </nav>
        </div>
      </header>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/40 animate-fade"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper animate-slide-left">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <span className="display text-lg tracking-[0.06em]">BROADWAY</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-1">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              <p className="label mb-4 text-ink-muted">Shop by</p>
              <ul className="mb-8 space-y-1">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={`/shop?category=${category.slug}`}
                      className="flex items-center justify-between border-b border-line/60 py-3.5 font-display text-xl"
                    >
                      {category.name}
                      <ChevronRight className="h-4 w-4 text-brass" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="label mb-4 text-ink-muted">For</p>
              <ul className="mb-8 flex gap-2">
                {AUDIENCES.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="label block border border-line px-4 py-2.5 text-ink-soft"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <hr className="rule-deco my-6" />

              <ul className="space-y-3.5">
                <li>
                  <Link href="/account" className="label-lg text-ink-soft">
                    {session?.user ? "My Account" : "Sign In"}
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="label-lg text-ink-soft">
                    My Orders
                  </Link>
                </li>
                <li>
                  <Link href="/stores" className="label-lg text-ink-soft">
                    Find a Store
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="label-lg text-ink-soft">
                    Our Story
                  </Link>
                </li>
                {session?.user && (
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="label-lg text-clay"
                    >
                      Sign Out
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
