import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const editorialSchema = z.object({
  imageUrl: z.string().trim().min(1, "Upload an image"),
  eyebrow: z.string().trim().max(80).nullable().optional(),
  heading: z.string().trim().max(160).nullable().optional(),
  href: z.string().trim().max(300).nullable().optional(),
  afterProducts: z.number().int().min(1).max(60).default(6),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const editorials = await db.shopEditorial.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ editorials });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = editorialSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.shopEditorial.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const editorial = await db.shopEditorial.create({ data });
  return NextResponse.json({ editorial }, { status: 201 });
}
