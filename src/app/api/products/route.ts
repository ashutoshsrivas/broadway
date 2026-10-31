import { NextRequest, NextResponse } from "next/server";
import { findProducts } from "@/lib/catalog";

/** Public catalogue search. Backs the header search overlay. */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const list = (key: string) => sp.getAll(key).filter(Boolean);
  const num = (key: string) => {
    const raw = sp.get(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  try {
    const result = await findProducts({
      q: sp.get("q")?.trim() || undefined,
      category: sp.get("category") || undefined,
      brand: list("brand"),
      gender: list("gender"),
      shape: list("shape"),
      material: list("material"),
      frameType: list("frameType"),
      minPrice: num("minPrice"),
      maxPrice: num("maxPrice"),
      exclusive: sp.get("exclusive") === "1",
      sale: sp.get("sale") === "1",
      sort: sp.get("sort") || undefined,
      page: num("page"),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Product search failed", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
