import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { panelSchema } from "../route";

const patchSchema = panelSchema.partial();

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const panel = await db.discoverPanel.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!panel) return NextResponse.json({ error: "Panel not found" }, { status: 404 });

  return NextResponse.json({ panel });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await db.discoverPanel.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
