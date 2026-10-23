import { db } from "@/lib/db";
import { ATTRIBUTE_KINDS, type Kind } from "@/lib/attributes";
import { UploadForm } from "@/components/admin/UploadForm";
import type { Candidate } from "@/lib/attributes";

export const dynamic = "force-dynamic";

export default async function UploadsPage() {
  // Every list is loaded once here and handed to the client, so matching runs
  // on each keystroke with no round-trip. Brands and categories are real
  // tables, so they are read from their own and shaped like the rest.
  const [values, brands, categories] = await Promise.all([
    db.attributeValue.findMany({
      orderBy: [{ usageCount: "desc" }, { label: "asc" }],
      select: { id: true, kind: true, label: true, slug: true, usageCount: true },
    }),
    db.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
    }),
  ]);

  const attributes = Object.fromEntries(
    ATTRIBUTE_KINDS.map((kind) => [
      kind,
      values
        .filter((v) => v.kind === kind)
        .map(({ id, label, slug, usageCount }) => ({ id, label, slug, usageCount })),
    ])
  ) as Record<Kind, Candidate[]>;

  const asCandidates = (rows: { id: string; name: string; slug: string; _count: { products: number } }[]) =>
    rows.map((r) => ({ id: r.id, label: r.name, slug: r.slug, usageCount: r._count.products }));

  return (
    <>
      <p className="label text-brass">Catalogue</p>
      <h1 className="display mt-3 text-4xl">Uploads</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Add a product fast. Every list below accepts a word that isn&rsquo;t in it yet — type it
        and press <kbd className="border border-line px-1.5 py-0.5 text-xs">Enter</kbd> to save it
        to the list and use it straight away. Close spellings fold into the word you already have,
        so the lists don&rsquo;t fill up with near-duplicates.
      </p>
      <hr className="rule-deco mt-6 mb-8" />

      <UploadForm
        attributes={attributes}
        brands={asCandidates(brands)}
        categories={asCandidates(categories)}
      />
    </>
  );
}
