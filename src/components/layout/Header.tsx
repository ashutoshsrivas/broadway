"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Search, User, Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { LogoMark } from "@/components/Logo";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { BagButton } from "@/components/store/BagButton";

import type { MenuItem, MenuPanel } from "@/lib/menu";

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

// Gender is stored as the shop writes it — "Men", not "MEN" — so the links
// carry the same casing the filters match on.
const AUDIENCES = [
  { label: "Men", href: "/shop?gender=Men" },
  { label: "Women", href: "/shop?gender=Women" },
  { label: "Kids", href: "/shop?gender=Kids" },
];

export function Header({ navLinks }: { navLinks: MenuItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerRoute, setDrawerRoute] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  // Which department's panel is dropped, on desktop and in the drawer. One at
  // a time: two open mega-panels would overlap each other.
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const [openDrawerPanel, setOpenDrawerPanel] = useState<string | null>(null);
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
    setOpenDrawerPanel(null);
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
        <div
          className="relative hidden border-b border-line bg-paper-raised/95 backdrop-blur-sm lg:block"
          onMouseLeave={() => setOpenPanel(null)}
        >
          <nav className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-center gap-x-9 gap-y-2 px-10 py-2.5">
            {navLinks.map((link) => (
              <div
                key={link.id}
                onMouseEnter={() => setOpenPanel(link.panel ? link.id : null)}
              >
                <Link
                  href={link.href}
                  target={link.newTab ? "_blank" : undefined}
                  rel={link.newTab ? "noopener noreferrer" : undefined}
                  // Focus opens the panel too, so the menu is reachable from
                  // the keyboard and not only from a mouse.
                  onFocus={() => setOpenPanel(link.panel ? link.id : null)}
                  aria-expanded={link.panel ? openPanel === link.id : undefined}
                  className={`label link-rule flex items-center gap-1.5 transition-colors ${
                    link.highlight ? "text-brass" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {link.label}
                  {link.panel && (
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        openPanel === link.id ? "rotate-180" : ""
                      }`}
                      strokeWidth={1.8}
                    />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {navLinks.map((link) =>
            link.panel && openPanel === link.id ? (
              <DesktopPanel key={link.id} panel={link.panel} />
            ) : null
          )}
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
              <p className="label mb-4 text-ink-muted">Shop</p>
              <ul className="mb-8 space-y-1">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    {link.panel ? (
                      <>
                        {/* The row is a button, not a link: on a phone the
                            department opens its own list rather than jumping
                            straight to an unfiltered grid. The list itself
                            ends with "Shop all". */}
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDrawerPanel((cur) => (cur === link.id ? null : link.id))
                          }
                          aria-expanded={openDrawerPanel === link.id}
                          className={`flex w-full items-center justify-between border-b border-line/60 py-3.5 text-left font-display text-xl ${
                            link.highlight ? "text-brass" : ""
                          }`}
                        >
                          {link.label}
                          <ChevronDown
                            className={`h-4 w-4 text-brass transition-transform ${
                              openDrawerPanel === link.id ? "rotate-180" : ""
                            }`}
                            strokeWidth={1.5}
                          />
                        </button>
                        {openDrawerPanel === link.id && <DrawerPanel panel={link.panel} />}
                      </>
                    ) : (
                      <Link
                        href={link.href}
                        target={link.newTab ? "_blank" : undefined}
                        rel={link.newTab ? "noopener noreferrer" : undefined}
                        className={`flex items-center justify-between border-b border-line/60 py-3.5 font-display text-xl ${
                          link.highlight ? "text-brass" : ""
                        }`}
                      >
                        {link.label}
                        <ChevronRight className="h-4 w-4 text-brass" strokeWidth={1.5} />
                      </Link>
                    )}
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
                  <Link href="/bo-exclusive" className="label-lg text-brass">
                    BO Exclusive
                  </Link>
                </li>
                <li>
                  <Link href="/shop-by-brand" className="label-lg text-ink-soft">
                    Shop by Brand
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="label-lg text-ink-soft">
                    Our Brands
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

/**
 * The mega-panel that drops out of a department on desktop.
 *
 * Four columns, in the order the shop asked for: who it is for, the shapes we
 * actually stock, the houses worth naming and the few that are not for
 * everyone. A column with nothing in it is left out rather than printed as an
 * empty heading.
 */
function DesktopPanel({ panel }: { panel: MenuPanel }) {
  const columns: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Shop for", links: panel.genders },
    { title: "Shape", links: panel.shapes },
    {
      title: "Top brands",
      links: panel.topBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}` })),
    },
    {
      title: "Exclusive luxury",
      links: panel.luxuryBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}` })),
    },
  ].filter((c) => c.links.length > 0);

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-paper shadow-[0_18px_40px_-28px_rgba(42,31,23,0.5)]">
      <div className="mx-auto max-w-[1500px] px-10 py-9">
        <div
          className="grid gap-x-10 gap-y-8"
          style={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))` }}
        >
          {columns.map((column) => (
            <div key={column.title}>
              <p className="label text-brass">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="label text-[0.68rem] text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-line pt-5">
          <Link href={panel.allHref} className="label link-rule text-ink">
            Shop all {panel.categoryName.toLowerCase()} →
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * The same panel inside the phone drawer, stacked rather than columned.
 *
 * Shapes and brands are laid out as tappable chips: a phone menu of forty
 * underlined links is a scroll nobody finishes.
 */
function DrawerPanel({ panel }: { panel: MenuPanel }) {
  const groups: { title: string; links: { label: string; href: string }[] }[] = [
    { title: "Shop for", links: panel.genders },
    { title: "Shape", links: panel.shapes },
    {
      title: "Top brands",
      links: panel.topBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}` })),
    },
    {
      title: "Exclusive luxury",
      links: panel.luxuryBrands.map((b) => ({ label: b.name, href: `/brands/${b.slug}` })),
    },
  ].filter((g) => g.links.length > 0);

  return (
    <div className="border-b border-line/60 bg-paper-raised px-4 py-5">
      {groups.map((group) => (
        <div key={group.title} className="mb-5 last:mb-0">
          <p className="label text-[0.55rem] text-brass">{group.title}</p>
          <ul className="mt-2.5 flex flex-wrap gap-2">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="label block border border-line bg-paper px-3.5 py-2 text-[0.6rem] text-ink-soft"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <Link
        href={panel.allHref}
        className="label mt-5 block border-t border-line pt-4 text-brass"
      >
        Shop all {panel.categoryName.toLowerCase()} →
      </Link>
    </div>
  );
}
