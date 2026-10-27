import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

export const bannerSchema = z.object({
  mediaUrl: z.string().trim().min(1, "Upload an image or video"),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  posterUrl: z.string().trim().max(500).nullable().optional(),

  eyebrow: z.string().trim().max(80).nullable().optional(),
  heading: z.string().trim().max(160).nullable().optional(),
  subheading: z.string().trim().max(400).nullable().optional(),
  ctaLabel: z.string().trim().max(40).nullable().optional(),
  ctaHref: z.string().trim().max(300).nullable().optional(),
  align: z.enum(["LEFT", "CENTRE", "RIGHT"]).default("LEFT"),

  overlay: z.number().int().min(0).max(80).default(35),
  // One second is below the point where a slide can be read at all; ten is
  // long enough that most visitors will have scrolled past regardless.
  durationMs: z.number().int().min(1000).max(30000).default(5000),

  sortOrder: z.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const banners = await db.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = bannerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // A new slide goes to the end of the running order unless placed explicitly.
  const data = { ...parsed.data };
  if (!data.sortOrder) {
    const last = await db.banner.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    data.sortOrder = (last?.sortOrder ?? 0) + 1;
  }

  const banner = await db.banner.create({ data });
  return NextResponse.json({ banner }, { status: 201 });
}
