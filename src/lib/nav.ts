import { db } from "@/lib/db";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  highlight: boolean;
  newTab: boolean;
};

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
  const sunglasses = categories.find((c) => /sun/.test(c.slug));
  const optical = categories.find((c) => /optical|eyeglass|spectacle/.test(c.slug));

  const seed = [
    { label: "Shop", href: "/shop", sortOrder: 1, highlight: false },
    ...(sunglasses
      ? [{ label: sunglasses.name, href: `/shop?category=${sunglasses.slug}`, sortOrder: 2, highlight: false }]
      : []),
    ...(optical
      ? [{ label: "Optical Frames", href: `/shop?category=${optical.slug}`, sortOrder: 3, highlight: false }]
      : []),
    { label: "Shop by Brand", href: "/shop-by-brand", sortOrder: 4, highlight: false },
    { label: "Sale", href: "/shop?sale=1", sortOrder: 5, highlight: true },
    { label: "Kids", href: "/shop?gender=Kids", sortOrder: 6, highlight: false },
    { label: "About Us", href: "/about", sortOrder: 7, highlight: false },
    { label: "Our Brands", href: "/brands", sortOrder: 8, highlight: false },
    // The Ray-Ban Meta smart glasses. A search rather than a category,
    // because the shop files them under whichever department they arrive
    // in — repoint it in the admin if that changes.
    { label: "Meta AI", href: "/shop?q=meta", sortOrder: 9, highlight: false },
  ];

  await db.navLink.createMany({ data: seed });

  return db.navLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, href: true, highlight: true, newTab: true },
  });
}
