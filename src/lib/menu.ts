import { db } from "@/lib/db";
import { getNavLinks, type NavItem } from "@/lib/nav";

export type MenuBrand = {
  name: string;
  slug: string;
  logoUrl: string | null;
  /** False when we list the house but have nothing on the shelf. */
  stocked: boolean;
};

export type MenuColumn = { title: string; links: { label: string; href: string }[] };

/**
 * The panel that drops out of a link in the top menu.
 *
 * Three shapes, discriminated by `kind`, because the three do genuinely
 * different jobs and a single shape with everything optional would make
 * every renderer guess what it had been handed.
 */
export type MenuPanel =
  | {
      kind: "department";
      title: string;
      genders: { label: string; href: string }[];
      topBrands: MenuBrand[];
      luxuryBrands: MenuBrand[];
      allHref: string;
    }
  | {
      kind: "shop";
      title: string;
      featuredBrands: MenuBrand[];
      genders: { label: string; href: string }[];
      categories: { label: string; href: string }[];
      allHref: string;
    }
  | {
      kind: "brands";
      title: string;
      brands: MenuBrand[];
      allHref: string;
    };

export type MenuItem = NavItem & { panel?: MenuPanel };

/** Men / Women / Unisex, as the shop writes them on the products. */
const GENDERS = ["Men", "Women", "Unisex"];

/** Pulls the category slug out of a nav link's href. */
function categorySlugOf(href: string): string | null {
  const match = /[?&]category=([^&]+)/.exec(href);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Is this link exactly that path, with nothing after it?
 *
 * Comparing only the path would hand the Shop dropdown to Sale, Kids and
 * Meta AI as well, because all three are `/shop` with a query on the end.
 * They are filters, not the department, and they open their own grid.
 */
function isExactly(href: string, path: string): boolean {
  const [base, query] = href.split("?");
  return base.replace(/\/$/, "") === path && !query;
}

export async function getMenu(): Promise<MenuItem[]> {
  const links = await getNavLinks();

  const wantedCategories = new Set(
    links.map((l) => categorySlugOf(l.href)).filter((s): s is string => Boolean(s))
  );
  const wantsShop = links.some((l) => isExactly(l.href, "/shop"));
  const wantsBrands = links.some((l) => isExactly(l.href, "/brands"));

  // One round for the whole menu. It runs on every page in the store, so it
  // reads flags and names, never counts of anything large.
  const [categories, brands, allBrands] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true, showInMenu: true },
    }),
    db.brand.findMany({
      where: {
        OR: [{ showInMenuTop: true }, { showInMenuLuxury: true }, { isFeatured: true }],
      },
      orderBy: { name: "asc" },
      select: {
        name: true,
        slug: true,
        logoUrl: true,
        showInMenuTop: true,
        showInMenuLuxury: true,
        isFeatured: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    }),
    // Every house, for the Our Brands panel — logos only, since that panel
    // is a wall of marks rather than a list of names.
    wantsBrands
      ? db.brand.findMany({
          orderBy: { name: "asc" },
          select: {
            name: true,
            slug: true,
            logoUrl: true,
            _count: { select: { products: { where: { status: "ACTIVE" } } } },
          },
        })
      : Promise.resolve([]),
  ]);

  const asMenuBrand = (b: {
    name: string;
    slug: string;
    logoUrl: string | null;
    _count: { products: number };
  }): MenuBrand => ({
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
    stocked: b._count.products > 0,
  });

  const topBrands = brands.filter((b) => b.showInMenuTop).map(asMenuBrand);
  const luxuryBrands = brands.filter((b) => b.showInMenuLuxury).map(asMenuBrand);
  const featuredBrands = brands.filter((b) => b.isFeatured).map(asMenuBrand);

  const departmentPanels = new Map<string, MenuPanel>(
    categories
      .filter((c) => c.showInMenu && wantedCategories.has(c.slug))
      .map((category) => {
        const base = `/shop?category=${encodeURIComponent(category.slug)}`;
        return [
          category.slug,
          {
            kind: "department" as const,
            title: category.name,
            genders: GENDERS.map((g) => ({
              label: g,
              href: `${base}&gender=${encodeURIComponent(g)}`,
            })),
            topBrands,
            luxuryBrands,
            allHref: base,
          },
        ];
      })
  );

  const shopPanel: MenuPanel | null = wantsShop
    ? {
        kind: "shop",
        title: "Shop",
        featuredBrands,
        genders: GENDERS.map((g) => ({
          label: g,
          href: `/shop?gender=${encodeURIComponent(g)}`,
        })),
        categories: categories.map((c) => ({
          label: c.name,
          href: `/shop?category=${encodeURIComponent(c.slug)}`,
        })),
        allHref: "/shop",
      }
    : null;

  const brandsPanel: MenuPanel | null = wantsBrands
    ? { kind: "brands", title: "Our Brands", brands: allBrands.map(asMenuBrand), allHref: "/brands" }
    : null;

  return links.map((link) => {
    const slug = categorySlugOf(link.href);
    if (slug) {
      const panel = departmentPanels.get(slug);
      return panel ? { ...link, panel } : link;
    }
    if (shopPanel && isExactly(link.href, "/shop")) return { ...link, panel: shopPanel };
    if (brandsPanel && isExactly(link.href, "/brands")) return { ...link, panel: brandsPanel };
    return link;
  });
}
