import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { trustBoxSchema } from "../route";

const patchSchema = trustBoxSchema.partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const box = await db.trustBox.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!box) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ box });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await db.trustBox.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
