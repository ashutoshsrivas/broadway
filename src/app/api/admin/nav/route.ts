import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const navSchema = z.object({
  label: z.string().trim().min(1, "Give the link a label").max(40),
  href: z.string().trim().min(1, "Where should it go?").max(300),
  highlight: z.boolean().default(false),
  newTab: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(99).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const links = await db.navLink.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ links });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = navSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.navLink.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const link = await db.navLink.create({ data });
  return NextResponse.json({ link }, { status: 201 });
}
