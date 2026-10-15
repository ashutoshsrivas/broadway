import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  logoUrl: z.string().trim().max(500).optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ brands });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const brand = await db.brand.create({
      data: {
        name: parsed.data.name,
        slug: slugify(parsed.data.name),
        logoUrl: parsed.data.logoUrl || null,
        isFeatured: parsed.data.isFeatured ?? false,
      },
    });
    return NextResponse.json({ brand }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That brand already exists." }, { status: 409 });
  }
}
