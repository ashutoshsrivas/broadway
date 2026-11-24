import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const trustBoxSchema = z.object({
  icon: z.string().trim().min(1).max(24).default("shield"),
  title: z.string().trim().min(1, "Give the box a title").max(60),
  note: z.string().trim().max(160).nullable().optional(),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = trustBoxSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.trustBox.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const box = await db.trustBox.create({ data });
  return NextResponse.json({ box }, { status: 201 });
}
