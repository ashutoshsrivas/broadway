import type { ProductCardData } from "@/lib/catalog";

/** Columns the shop grid uses at its widest. Mirrors `lg:grid-cols-3`. */
export const SHOP_COLUMNS = 3;

/** Default rows of product between one editorial image and the next. */
export const DEFAULT_ROWS_BETWEEN = 3;

export type Editorial = {
  id: string;
  imageUrl: string;
  eyebrow: string | null;
  heading: string | null;
  href: string | null;
};

export type Cell =
  | { kind: "product"; product: ProductCardData }
  | { kind: "editorial"; editorial: Editorial; side: "left" | "right" };

/**
 * Lay out the shop grid, dropping an editorial image in every few rows.
 *
 * Each image is two columns wide and two rows tall, and they alternate sides
 * down the page so the eye is pulled left, then right, rather than down one
 * rail.
 *
 * Which side an image lands on is decided by WHERE it is inserted, not by a
 * CSS column-start: in a three-column grid an item spanning two columns sits
 * left when it falls on a row boundary and right when exactly one product
 * precedes it on that row. Letting the natural grid flow do the work means
 * there are never holes to backfill, which `grid-auto-flow: dense` would
 * otherwise have to paper over by reordering products out of their sorted
 * sequence.
 *
 * So the rule is: wait until enough rows have passed, then insert at the next
 * position whose column index matches the side we want.
 */
export function buildShopGrid(
  products: ProductCardData[],
  editorials: Editorial[],
  rowsBetween: number = DEFAULT_ROWS_BETWEEN
): Cell[] {
  const cells: Cell[] = [];
  if (editorials.length === 0) {
    return products.map((product) => ({ kind: "product", product }));
  }

  const gap = Math.max(1, rowsBetween);
  let next = 0;
  let rowsSinceLast = 0;

  for (let i = 0; i < products.length; i++) {
    cells.push({ kind: "product", product: products[i] });

    // A row completes every time the cell count crosses a multiple of the
    // column count.
    if (cells.length % SHOP_COLUMNS === 0) rowsSinceLast += 1;

    const editorial = editorials[next];
    if (!editorial || rowsSinceLast < gap) continue;

    // An image is two rows tall, and those rows are only as tall as the
    // products sitting beside it. Place one with nothing following and the
    // second row never forms, so the image renders squat — about half the
    // height of the one above it. Needs a product for each of its two rows in
    // the remaining column.
    const productsLeft = products.length - 1 - i;
    if (productsLeft < SHOP_COLUMNS - 1) break;

    // Even images sit left (column 0), odd ones right (column 1) — the only
    // two positions a two-wide block can take in a three-column grid.
    const side = next % 2 === 0 ? "left" : "right";
    const wantColumn = side === "left" ? 0 : 1;

    if (cells.length % SHOP_COLUMNS === wantColumn) {
      cells.push({ kind: "editorial", editorial, side });
      next += 1;
      rowsSinceLast = 0;
    }
  }

  return cells;
}
