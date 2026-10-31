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

  const seed = [
    ...categories.map((c, i) => ({
      label: c.name,
      href: `/shop?category=${c.slug}`,
      sortOrder: i + 1,
      highlight: false,
    })),
    { label: "Brands", href: "/brands", sortOrder: 90, highlight: false },
    { label: "BO Exclusive", href: "/bo-exclusive", sortOrder: 91, highlight: true },
    { label: "Sale", href: "/shop?sale=1", sortOrder: 92, highlight: true },
  ];

  await db.navLink.createMany({ data: seed });

  return db.navLink.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, label: true, href: true, highlight: true, newTab: true },
  });
}
