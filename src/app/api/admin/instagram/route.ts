import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const postSchema = z.object({
  imageUrl: z.string().trim().min(1, "Upload an image"),
  href: z.string().trim().max(400).nullable().optional(),
  caption: z.string().trim().max(400).nullable().optional(),
  sortOrder: z.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const posts = await db.instagramPost.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.instagramPost.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const post = await db.instagramPost.create({ data });
  return NextResponse.json({ post }, { status: 201 });
}
