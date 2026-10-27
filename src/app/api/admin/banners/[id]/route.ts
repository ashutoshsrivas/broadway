import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { bannerSchema } from "../route";

// Every field optional: the admin list toggles "active" and nudges the running
// order without resubmitting the whole slide.
const patchSchema = bannerSchema.partial();

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

  const banner = await db.banner.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!banner) return NextResponse.json({ error: "Banner not found" }, { status: 404 });

  return NextResponse.json({ banner });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  await db.banner.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
