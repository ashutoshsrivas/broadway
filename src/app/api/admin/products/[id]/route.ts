import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { productSchema } from "../route";
import { slugify } from "@/lib/utils";
import { resolveValue } from "@/lib/attributes";
import { syncSoldOut } from "@/lib/stock-status";

async function uniqueSlug(name: string, excludeId: string): Promise<string> {
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { images, variants, ...fields } = parsed.data;

  const [gender, shape, material, size, origin] = await Promise.all([
    resolveValue("GENDER", fields.gender ?? "Unisex"),
    fields.shape ? resolveValue("SHAPE", fields.shape) : null,
    fields.material ? resolveValue("MATERIAL", fields.material) : null,
    fields.size ? resolveValue("SIZE", fields.size) : null,
    fields.countryOfOrigin ? resolveValue("ORIGIN", fields.countryOfOrigin) : null,
  ]);

  try {
    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...fields,
          gender: gender ?? "Unisex",
          shape,
          material,
          size,
          countryOfOrigin: origin,
          description: fields.description || null,
          brandId: fields.brandId || null,
          slug: await uniqueSlug(fields.name, id),
        },
      });

      // Images are a plain ordered list with no history worth keeping —
      // replacing them wholesale is simpler than diffing.
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((url, i) => ({ productId: id, url, sortOrder: i })),
        });
      }

      // Variants ARE diffed: an existing variant id is referenced by past
      // order items, so deleting and recreating would orphan order history and
      // throw away stock counts.
      const keepIds = variants.map((v) => v.id).filter(Boolean) as string[];
      await tx.productVariant.deleteMany({
        where: { productId: id, id: { notIn: keepIds.length ? keepIds : ["__none__"] } },
      });

      for (const v of variants) {
        const data = {
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex || null,
          priceOverride: v.priceOverride ?? null,
          stock: v.stock,
        };
        if (v.id) {
          await tx.productVariant.update({ where: { id: v.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId: id } });
        }
      }

      await syncSoldOut(tx, [id]);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "That SKU is already used by another product." }, { status: 409 });
    }
    console.error("Product update failed", err);
    return NextResponse.json({ error: "Could not save the product." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    // A product whose variants appear on past orders can't be removed without
    // losing that history — archiving is the correct move instead.
    return NextResponse.json(
      { error: "This product has order history. Set its status to Archived instead." },
      { status: 409 }
    );
  }
}
