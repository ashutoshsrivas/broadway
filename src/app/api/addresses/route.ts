import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a valid phone"),
  line1: z.string().trim().min(1).max(300),
  line2: z.string().trim().max(300).optional(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  pincode: z.string().trim().refine((v) => /^\d{6}$/.test(v), "Enter a valid 6-digit PIN code"),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const userId = session.user.id;
  const address = await db.$transaction(async (tx) => {
    // Exactly one default per user: clear the old one in the same transaction.
    if (parsed.data.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    const count = await tx.address.count({ where: { userId } });
    return tx.address.create({
      data: {
        ...parsed.data,
        line2: parsed.data.line2 || null,
        userId,
        // The first address a shopper saves is their default, whatever they ticked.
        isDefault: parsed.data.isDefault || count === 0,
      },
    });
  });

  return NextResponse.json({ address }, { status: 201 });
}
