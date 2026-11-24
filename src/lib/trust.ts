import { db } from "@/lib/db";

export type TrustBoxData = {
  id: string;
  icon: string;
  title: string;
  note: string | null;
};

/**
 * The four promises in the strip, as the shop has written them.
 *
 * Seeded on first read so a fresh install shows the same four boxes the site
 * shipped with, and so the shop has something to edit rather than an empty
 * list and a blank page.
 */
/**
 * Fixed ids, not generated ones. Two requests arriving together both find the
 * table empty and both try to seed it; with generated ids that writes the
 * four boxes twice and the strip renders eight. A fixed id turns the second
 * write into a no-op.
 */
const SEED: { id: string; icon: string; title: string; note: string }[] = [
  { id: "trust-shipping", icon: "truck", title: "Free Shipping", note: "On every order above ₹2,000" },
  { id: "trust-authentic", icon: "shield", title: "100% Authentic", note: "Brand warranty on every frame" },
  { id: "trust-eye-test", icon: "eye", title: "Free Eye Test", note: "At all Broadway stores" },
  { id: "trust-returns", icon: "returns", title: "14-Day Returns", note: "Unworn frames, no questions" },
];

export async function getTrustBoxes(): Promise<TrustBoxData[]> {
  const rows = await db.trustBox.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, icon: true, title: true, note: true },
  });
  if (rows.length > 0) return rows;

  // Nothing in the table at all — not merely nothing active — means this store
  // has never been seeded. Write the originals once and use them.
  const total = await db.trustBox.count();
  if (total > 0) return [];

  await db.trustBox.createMany({
    data: SEED.map((box, i) => ({ ...box, sortOrder: i })),
    skipDuplicates: true,
  });

  return db.trustBox.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, icon: true, title: true, note: true },
  });
}
