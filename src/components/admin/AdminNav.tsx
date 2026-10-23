"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, Tags, Receipt, Store, LogOut, Upload } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/uploads", label: "Uploads", icon: Upload },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="px-3 pb-4 lg:px-3 lg:pb-6">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`label flex shrink-0 items-center gap-3 whitespace-nowrap px-4 py-3 transition-colors ${
                  active ? "bg-paper/10 text-brass" : "text-paper/55 hover:text-paper"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {label}
              </Link>
            </li>
          );
        })}

        <li className="lg:mt-6 lg:border-t lg:border-paper/10 lg:pt-4">
          <Link
            href="/"
            className="label flex shrink-0 items-center gap-3 whitespace-nowrap px-4 py-3 text-paper/55 transition-colors hover:text-paper"
          >
            <Store className="h-4 w-4" strokeWidth={1.5} />
            View Store
          </Link>
        </li>
        <li>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="label flex w-full shrink-0 items-center gap-3 whitespace-nowrap px-4 py-3 text-paper/55 transition-colors hover:text-clay"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  );
}
