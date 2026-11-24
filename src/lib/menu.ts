import { db } from "@/lib/db";
import { getNavLinks, type NavItem } from "@/lib/nav";

export type MenuBrand = { name: string; slug: string };

/** The panel that drops out of a department in the top menu. */
export type MenuPanel = {
  categorySlug: string;
  categoryName: string;
  genders: { label: string; href: string }[];
  shapes: { label: string; href: string }[];
  topBrands: MenuBrand[];
  luxuryBrands: MenuBrand[];
  allHref: string;
};

export type MenuItem = NavItem & { panel?: MenuPanel };

/** Men / Women / Unisex, as the brief lists them. */
const GENDERS = ["Men", "Women", "Unisex"];

/**
 * Pulls the category slug out of a nav link's href.
 *
 * The nav table stays the shop's to arrange — labels, order, what is on it at
 * all. A dropdown is attached by matching the link's destination to a
 * department that has been flagged for one, so the two stay in step without
 * the shop having to configure the menu twice.
 */
function categorySlugOf(href: string): string | null {
  const match = /[?&]category=([^&]+)/.exec(href);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * The header menu: the shop's own links, with a panel under the departments
 * that have been given one.
 *
 * One round of queries for the whole menu. It runs on every page, so it reads
 * the vocabulary and the brand flags rather than counting products.
 */
export async function getMenu(): Promise<MenuItem[]> {
  const links = await getNavLinks();

  const wanted = new Set(
    links.map((l) => categorySlugOf(l.href)).filter((s): s is string => Boolean(s))
  );
  if (wanted.size === 0) return links;

  const [categories, shapes, brands] = await Promise.all([
    db.category.findMany({
      where: { isActive: true, showInMenu: true, slug: { in: [...wanted] } },
      select: { name: true, slug: true },
    }),
    // Shapes come from the upload vocabulary, so a shape the shop coins on a
    // Tuesday is in the menu on the Tuesday.
    db.attributeValue.findMany({
      where: { kind: "SHAPE" },
      orderBy: [{ usageCount: "desc" }, { label: "asc" }],
      take: 8,
      select: { label: true, slug: true },
    }),
    db.brand.findMany({
      where: { OR: [{ showInMenuTop: true }, { showInMenuLuxury: true }] },
      orderBy: { name: "asc" },
      select: { name: true, slug: true, showInMenuTop: true, showInMenuLuxury: true },
    }),
  ]);

  const topBrands = brands.filter((b) => b.showInMenuTop).map(({ name, slug }) => ({ name, slug }));
  const luxuryBrands = brands
    .filter((b) => b.showInMenuLuxury)
    .map(({ name, slug }) => ({ name, slug }));

  const panels = new Map<string, MenuPanel>(
    categories.map((category) => {
      const base = `/shop?category=${encodeURIComponent(category.slug)}`;
      return [
        category.slug,
        {
          categorySlug: category.slug,
          categoryName: category.name,
          genders: GENDERS.map((g) => ({
            label: g,
            href: `${base}&gender=${encodeURIComponent(g)}`,
          })),
          shapes: shapes.map((s) => ({
            label: s.label,
            href: `${base}&shape=${encodeURIComponent(s.label)}`,
          })),
          topBrands,
          luxuryBrands,
          allHref: base,
        },
      ];
    })
  );

  return links.map((link) => {
    const slug = categorySlugOf(link.href);
    const panel = slug ? panels.get(slug) : undefined;
    return panel ? { ...link, panel } : link;
  });
}
