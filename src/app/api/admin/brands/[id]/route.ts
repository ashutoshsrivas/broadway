import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

const schema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  logoUrl: z.string().trim().max(500).nullable().optional(),
  isFeatured: z.boolean().optional(),
  showInNewArrivals: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(999).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const brand = await db.brand.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });

  return NextResponse.json({ brand });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const count = await db.product.count({ where: { brandId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `${count} product(s) still use this brand. Move them first.` },
      { status: 409 }
    );
  }

  await db.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
