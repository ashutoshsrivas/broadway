import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().trim().min(1, "SKU is required").max(60),
  colorName: z.string().trim().min(1, "Colour name is required").max(80),
  colorHex: z.string().trim().max(9).optional(),
  priceOverride: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().min(0),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(5000).optional(),
  categoryId: z.string().min(1, "Pick a category"),
  brandId: z.string().nullable().optional(),
  mrp: z.number().positive("MRP must be greater than zero"),
  price: z.number().positive("Price must be greater than zero"),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
  frameShape: z
    .enum(["AVIATOR", "WAYFARER", "ROUND", "SQUARE", "RECTANGLE", "CAT_EYE", "OVAL", "GEOMETRIC", "SPORT"])
    .nullable()
    .optional(),
  frameMaterial: z
    .enum(["ACETATE", "METAL", "TITANIUM", "TR90", "COMBINATION", "WOOD"])
    .nullable()
    .optional(),
  frameType: z.enum(["FULL_RIM", "HALF_RIM", "RIMLESS"]).nullable().optional(),
  frameWidthMm: z.number().int().positive().nullable().optional(),
  lensType: z.string().trim().max(120).nullable().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  images: z.array(z.string().trim().min(1)).max(8),
  variants: z.array(variantSchema).min(1, "Add at least one colour"),
});

/** A product's slug must be unique; append -2, -3… until it is. */
async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "frame";
  let slug = base;
  let n = 1;
  for (;;) {
    const clash = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (!clash || clash.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { select: { stock: true } },
    },
  });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { images, variants, ...fields } = parsed.data;

  try {
    const product = await db.product.create({
      data: {
        ...fields,
        description: fields.description || null,
        brandId: fields.brandId || null,
        slug: await uniqueSlug(fields.name),
        images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
        variants: {
          create: variants.map((v) => ({
            sku: v.sku,
            colorName: v.colorName,
            colorHex: v.colorHex || null,
            priceOverride: v.priceOverride ?? null,
            stock: v.stock,
          })),
        },
      },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "That SKU is already used by another product." }, { status: 409 });
    }
    console.error("Product create failed", err);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
