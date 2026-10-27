import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const panelSchema = z.object({
  eyebrow: z.string().trim().max(80).nullable().optional(),
  heading: z.string().trim().min(1, "Give the panel a heading").max(120),
  mediaUrl: z.string().trim().max(500).nullable().optional(),
  posterUrl: z.string().trim().min(1, "Upload a thumbnail image").max(500),
  href: z.string().trim().min(1, "Where should it link to?").max(300),
  overlay: z.number().int().min(0).max(80).default(30),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const panels = await db.discoverPanel.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ panels });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = panelSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.discoverPanel.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const panel = await db.discoverPanel.create({ data });
  return NextResponse.json({ panel }, { status: 201 });
}
