import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { PLACEMENTS } from "@/lib/home-blocks";

export const brandBlockSchema = z.object({
  brandId: z.string().trim().min(1, "Choose a brand"),
  placement: z
    .enum([PLACEMENTS.afterRails, PLACEMENTS.underNewArrivals])
    .default(PLACEMENTS.afterRails),
  eyebrow: z.string().trim().max(80).nullable().optional(),
  heading: z.string().trim().max(160).nullable().optional(),
  blurb: z.string().trim().max(600).nullable().optional(),
  ctaLabel: z.string().trim().max(60).nullable().optional(),
  productAId: z.string().trim().nullable().optional(),
  productBId: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = brandBlockSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.homeBrandBlock.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  // A block pointing at a brand that no longer exists would 500 the homepage,
  // so the reference is checked here rather than trusted from the form.
  const brand = await db.brand.findUnique({ where: { id: data.brandId }, select: { id: true } });
  if (!brand) return NextResponse.json({ error: "That brand no longer exists" }, { status: 400 });

  const block = await db.homeBrandBlock.create({
    data,
    include: { brand: { select: { name: true, slug: true, logoUrl: true, accentHex: true } } },
  });
  return NextResponse.json({ block }, { status: 201 });
}
