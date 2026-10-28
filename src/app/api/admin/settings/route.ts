import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getSettings, putSettings } from "@/lib/settings";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  return NextResponse.json({ settings: await getSettings() });
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // putSettings ignores unknown keys, so a stray field cannot write junk rows.
  const entries = Object.fromEntries(
    Object.entries(body as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
  );

  await putSettings(entries);
  return NextResponse.json({ ok: true });
}
