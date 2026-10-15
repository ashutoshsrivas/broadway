import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, callerIp } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine((v) => !v || v.replace(/\D/g, "").length >= 10, "Enter a valid 10-digit phone"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export async function POST(req: NextRequest) {
  const { limited } = rateLimit({ key: `register:${callerIp(req)}`, max: 5, windowMs: 60_000 });
  if (limited) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  await db.user.create({
    data: {
      email,
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      password: await bcrypt.hash(parsed.data.password, 10),
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
