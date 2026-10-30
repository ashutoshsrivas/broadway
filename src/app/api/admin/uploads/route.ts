import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { resolveValue } from "@/lib/attributes";
import { slugify } from "@/lib/utils";

/**
 * The Uploads form: create a product from free-text attributes.
 *
 * Every list field arrives as whatever the person typed. `resolveValue` folds
 * it into the existing vocabulary when it recognises it and coins a new entry
 * when it does not — so the lists grow as the catalogue does, with no
 * migration and no redeploy.
 */
const schema = z.object({
  name: z.string().trim().min(1, "Give the product a name").max(200),
  description: z.string().trim().max(5000).optional(),

  // Brand and category are real tables with their own pages, so they come in
  // as free text here too and are found-or-created below.
  brand: z.string().trim().max(80).optional(),
  category: z.string().trim().min(1, "Choose or type a category").max(80),

  mrp: z.number().positive("MRP must be greater than zero"),
  price: z.number().positive("Price must be greater than zero"),

  gender: z.string().trim().max(60).optional(),
  colour: z.string().trim().min(1, "Give the frame a colour").max(60),
  material: z.string().trim().max(60).optional(),
  shape: z.string().trim().max(60).optional(),
  size: z.string().trim().max(60).optional(),
  countryOfOrigin: z.string().trim().max(60).optional(),

  isLimitedEdition: z.boolean().default(false),
  isBoExclusive: z.boolean().default(false),
  stock: z.number().int().min(0).max(100000).default(0),
  sku: z.string().trim().max(60).optional(),
  images: z.array(z.string().trim().min(1)).max(8).default([]),
  status: z.enum(["DRAFT", "ACTIVE"]).default("ACTIVE"),
});

/** Find-or-create a brand by typed name, case-insensitively. */
async function resolveBrand(name: string | undefined): Promise<string | null> {
  const clean = name?.trim();
  if (!clean) return null;

  const slug = slugify(clean);
  if (!slug) return null;

  const existing = await db.brand.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return existing.id;

  const created = await db.brand.create({
    data: { name: clean, slug },
    select: { id: true },
  });
  return created.id;
}

async function resolveCategory(name: string): Promise<string> {
  const slug = slugify(name);
  const existing = await db.category.findUnique({ where: { slug }, select: { id: true } });
  if (existing) return existing.id;

  const created = await db.category.create({
    data: { name: name.trim(), slug, sortOrder: 99 },
    select: { id: true },
  });
  return created.id;
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "frame";
  let slug = base;
  let n = 1;
  for (;;) {
    const clash = await db.product.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  if (d.price > d.mrp) {
    return NextResponse.json(
      { error: "Selling price cannot be higher than MRP." },
      { status: 400 }
    );
  }

  try {
    // Fold each typed word into its list first. These also bump usage counts,
    // which is what makes the combobox offer the shop's real favourites first.
    const [gender, colour, material, shape, size, origin, brandId, categoryId] =
      await Promise.all([
        resolveValue("GENDER", d.gender ?? "Unisex"),
        resolveValue("COLOUR", d.colour),
        d.material ? resolveValue("MATERIAL", d.material) : null,
        d.shape ? resolveValue("SHAPE", d.shape) : null,
        d.size ? resolveValue("SIZE", d.size) : null,
        d.countryOfOrigin ? resolveValue("ORIGIN", d.countryOfOrigin) : null,
        resolveBrand(d.brand),
        resolveCategory(d.category),
      ]);

    const slug = await uniqueSlug(d.brand ? `${d.brand} ${d.name}` : d.name);

    // A blank SKU gets a generated one — it is uniquely indexed, and an empty
    // string would collide on the second product saved without one.
    const sku =
      d.sku?.trim() ||
      `${slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14)}-${(colour ?? "STD")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6)}`;

    const product = await db.product.create({
      data: {
        name: d.name,
        slug,
        description: d.description || null,
        categoryId,
        brandId,
        mrp: d.mrp,
        price: d.price,
        gender: gender ?? "Unisex",
        shape,
        material,
        size,
        countryOfOrigin: origin,
        isLimitedEdition: d.isLimitedEdition,
        isBoExclusive: d.isBoExclusive,
        status: d.status,
        isNewArrival: true,
        images: { create: d.images.map((url, i) => ({ url, sortOrder: i })) },
        variants: {
          create: [{ sku, colorName: colour ?? "Standard", stock: d.stock }],
        },
      },
      select: { id: true, slug: true, name: true },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "That SKU is already used by another product." },
        { status: 409 }
      );
    }
    console.error("Upload failed", err);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}
