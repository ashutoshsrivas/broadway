import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

/**
 * Gate for every /api/admin/* handler.
 *
 * Returns a 401 response to return early with, or null when the caller is an
 * active admin. Written as "return the error" rather than "throw" so each
 * handler's guard is one visible line at the top of the function.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
