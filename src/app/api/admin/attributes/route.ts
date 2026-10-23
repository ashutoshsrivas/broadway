import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import {
  ATTRIBUTE_KINDS,
  isKind,
  listVocabulary,
  matchVocabulary,
  normalise,
  tidyLabel,
} from "@/lib/attributes";
import type { AttributeKind } from "@prisma/client";

/**
 * GET /api/admin/attributes            → every list, keyed by kind
 * GET /api/admin/attributes?kind=SHAPE&q=catt → ranked matches for the typed text
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const kind = req.nextUrl.searchParams.get("kind");
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!kind) {
    // The upload form loads every list once on mount, so matching can then run
    // in the browser on each keystroke with no further round-trips.
    const all = await db.attributeValue.findMany({
      orderBy: [{ usageCount: "desc" }, { label: "asc" }],
      select: { id: true, kind: true, label: true, slug: true, usageCount: true },
    });

    const grouped = Object.fromEntries(
      ATTRIBUTE_KINDS.map((k) => [k, all.filter((v) => v.kind === k)])
    );
    return NextResponse.json({ attributes: grouped });
  }

  if (!isKind(kind)) {
    return NextResponse.json({ error: "Unknown attribute kind" }, { status: 400 });
  }

  const vocabulary = await listVocabulary(kind);
  if (!q) return NextResponse.json({ exact: null, suggestions: vocabulary.slice(0, 8) });

  return NextResponse.json(matchVocabulary(q, vocabulary));
}

const createSchema = z.object({
  kind: z.string().refine(isKind, "Unknown attribute kind"),
  label: z.string().trim().min(1, "Enter a value").max(60),
});

/**
 * POST — add a word to a list.
 *
 * This is what Enter on an unrecognised value calls. It is idempotent: an
 * entry that already exists (in any casing or spacing) is returned rather than
 * duplicated, so double-submitting cannot split a list into near-identical
 * twins.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const kind = parsed.data.kind as AttributeKind;
  const label = tidyLabel(parsed.data.label);
  const slug = normalise(label);
  if (!slug) {
    return NextResponse.json({ error: "Enter a value with letters or digits" }, { status: 400 });
  }

  const existing = await db.attributeValue.findUnique({
    where: { kind_slug: { kind, slug } },
    select: { id: true, label: true, slug: true, usageCount: true },
  });
  if (existing) return NextResponse.json({ value: existing, created: false });

  const value = await db.attributeValue.create({
    data: { kind, label, slug },
    select: { id: true, label: true, slug: true, usageCount: true },
  });
  return NextResponse.json({ value, created: true }, { status: 201 });
}

const deleteSchema = z.object({ id: z.string().min(1) });

/** Remove a word from a list. Products already filed under it keep their text. */
export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = deleteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await db.attributeValue.delete({ where: { id: parsed.data.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
