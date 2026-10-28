import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { editorialSchema } from "../route";

const patchSchema = editorialSchema.partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const editorial = await db.shopEditorial
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);
  if (!editorial) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ editorial });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await db.shopEditorial.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
