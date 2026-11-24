import { db } from "@/lib/db";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  highlight: boolean;
  newTab: boolean;
};

/** Sunglasses and optical frames lead the row; everything else keeps its order. */
function rank(slug: string): number {
  if (/sun/.test(slug)) return 0;
  if (/optical|eyeglass|spectacle/.test(slug)) return 1;
  return 2;
}

/**
 * The header's category rail.
 *
 * Seeded once from the live departments plus the standing pages, so a fresh
 * install has a working navbar without anyone configuring one. After that the
 * table is the authority and the admin owns it — the rail is no longer a
 * mirror of the category list.
 */
export async function getNavLinks(): Promise<NavItem[]> {
  const existing = await db.navLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, href: true, highlight: true, newTab: true },
  });
  if (existing.length > 0) return existing;

  if ((await db.navLink.count()) > 0) return []; // emptied on purpose

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true },
  });

  // The structure the shop asked for. Departments first, in the order they
  // are filed, then the standing pages. Sunglasses and Optical Frames pick up
  // their dropdowns automatically — see lib/menu.ts — by being categories
  // flagged for one, so this list stays a plain row of links the shop can
  // rearrange without knowing that.
  const ordered = [...categories].sort((a, b) => rank(a.slug) - rank(b.slug));

  const seed = [
    ...ordered.map((c, i) => ({
      label: c.name,
      href: `/shop?category=${c.slug}`,
      sortOrder: i + 1,
      highlight: false,
    })),
    { label: "Shop by Brand", href: "/shop-by-brand", sortOrder: 88, highlight: false },
    { label: "Sale", href: "/shop?sale=1", sortOrder: 89, highlight: true },
    { label: "Kids", href: "/shop?gender=Kids", sortOrder: 90, highlight: false },
    { label: "About Us", href: "/about", sortOrder: 91, highlight: false },
    { label: "Our Brands", href: "/brands", sortOrder: 92, highlight: false },
    { label: "BO Exclusive", href: "/bo-exclusive", sortOrder: 93, highlight: true },
  ];

  await db.navLink.createMany({ data: seed });

  return db.navLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, href: true, highlight: true, newTab: true },
  });
}
