import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { brandBlockSchema } from "../route";

const patchSchema = brandBlockSchema.partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const block = await db.homeBrandBlock
    .update({
      where: { id },
      data: parsed.data,
      include: { brand: { select: { name: true, slug: true, logoUrl: true, accentHex: true } } },
    })
    .catch(() => null);
  if (!block) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ block });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await db.homeBrandBlock.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
