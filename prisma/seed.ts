/**
 * Seed the Broadway Opticals catalogue.
 *
 * Idempotent: every write is an upsert keyed on a slug or SKU, so running it
 * twice refreshes the demo data instead of duplicating it.
 *
 *   npm run db:seed
 */
import { PrismaClient, type Gender, type FrameShape, type FrameMaterial, type FrameType } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const CATEGORIES = [
  {
    name: "Sunglasses",
    slug: "sunglasses",
    description: "Polarised and UV400 protection from the houses that defined the form.",
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Eyeglasses",
    slug: "eyeglasses",
    description: "Prescription frames, cut and fitted by our own opticians.",
    imageUrl: "https://images.unsplash.com/photo-1603578119639-798b8413d8d7?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Computer Glasses",
    slug: "computer-glasses",
    description: "Blue-light filtering lenses for long days at a screen.",
    imageUrl: "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Contact Lenses",
    slug: "contact-lenses",
    description: "Daily, monthly and toric lenses from trusted makers.",
    imageUrl: "https://images.unsplash.com/photo-1599114317549-8d4e5233021f?w=1200&q=80&auto=format&fit=crop",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Cases, cords, cloths and the solutions that keep lenses clear.",
    imageUrl: "https://images.unsplash.com/photo-1608539733377-5557e02926b5?w=1200&q=80&auto=format&fit=crop",
  },
];

const BRANDS = [
  { name: "Ray-Ban", slug: "ray-ban", isFeatured: true },
  { name: "Oakley", slug: "oakley", isFeatured: true },
  { name: "Persol", slug: "persol", isFeatured: true },
  { name: "Tom Ford", slug: "tom-ford", isFeatured: true },
  { name: "Gucci", slug: "gucci", isFeatured: true },
  { name: "Prada", slug: "prada", isFeatured: true },
  { name: "Carrera", slug: "carrera", isFeatured: true },
  { name: "Titan Eye+", slug: "titan-eye-plus", isFeatured: true },
  { name: "Broadway", slug: "broadway", isFeatured: false },
  { name: "Acuvue", slug: "acuvue", isFeatured: false },
];

// A handful of eyewear photographs, reused across the catalogue so every tile
// has a real image without shipping binaries in the repo.
const SHOTS = [
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80&auto=format&fit=crop", // round gold sunglasses
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&q=80&auto=format&fit=crop", // black wayfarer
  "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200&q=80&auto=format&fit=crop", // tortoise clubmaster
  "https://images.unsplash.com/photo-1603578119639-798b8413d8d7?w=1200&q=80&auto=format&fit=crop", // tortoise round acetate
  "https://images.unsplash.com/photo-1577803645773-f96470509666?w=1200&q=80&auto=format&fit=crop", // tinted sunglasses
  "https://images.unsplash.com/photo-1483412468200-72182dbbc544?w=1200&q=80&auto=format&fit=crop", // round optical, mono
  "https://images.unsplash.com/photo-1614715838608-dd527c46231d?w=1200&q=80&auto=format&fit=crop", // gold wire round
  "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=1200&q=80&auto=format&fit=crop", // rose cat-eye
  "https://images.unsplash.com/photo-1556306510-31ca015374b0?w=1200&q=80&auto=format&fit=crop",   // black rectangle
  "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=1200&q=80&auto=format&fit=crop", // clubmaster, bokeh
];

type Seed = {
  name: string;
  slug: string;
  brand: string;
  category: string;
  mrp: number;
  price: number;
  gender: Gender;
  shape?: FrameShape;
  material?: FrameMaterial;
  rim?: FrameType;
  width?: number;
  lens?: string;
  description: string;
  featured?: boolean;
  isNew?: boolean;
  colours: { name: string; hex: string; stock: number }[];
};

const PRODUCTS: Seed[] = [
  {
    name: "0RB 3025 Aviator Classic",
    slug: "rb-3025-aviator-classic",
    brand: "ray-ban",
    category: "sunglasses",
    mrp: 12790, price: 11511,
    gender: "UNISEX", shape: "AVIATOR", material: "METAL", rim: "FULL_RIM", width: 140,
    lens: "G-15 Polarised",
    description:
      "The frame that started it all. Designed in 1937 for US Air Force pilots and unchanged in silhouette since — thin metal temples, a double bridge, and teardrop lenses that still suit almost every face.",
    featured: true,
    colours: [
      { name: "Gold / Green", hex: "#C8A35A", stock: 14 },
      { name: "Gunmetal / Grey", hex: "#5A5F63", stock: 9 },
      { name: "Black / Polarised", hex: "#1A1A1A", stock: 3 },
    ],
  },
  {
    name: "0RB 2140 Original Wayfarer",
    slug: "rb-2140-original-wayfarer",
    brand: "ray-ban",
    category: "sunglasses",
    mrp: 11890, price: 10701,
    gender: "UNISEX", shape: "WAYFARER", material: "ACETATE", rim: "FULL_RIM", width: 137,
    lens: "Crystal Green",
    description:
      "Heavy acetate, a forward rake, and the trapezoid front that made the Wayfarer the most recognisable frame of the twentieth century.",
    featured: true,
    colours: [
      { name: "Tortoise", hex: "#6B4423", stock: 11 },
      { name: "Black", hex: "#141414", stock: 18 },
    ],
  },
  {
    name: "PO 0714 Steve McQueen",
    slug: "persol-po-0714-steve-mcqueen",
    brand: "persol",
    category: "sunglasses",
    mrp: 28900, price: 26010,
    gender: "MEN", shape: "OVAL", material: "ACETATE", rim: "FULL_RIM", width: 136,
    lens: "Blue Polarised",
    description:
      "The folding original, with Persol's Meflecto flex stems and the arrow hinge. Made in Italy, and still folded down to the size of a cigarette case.",
    featured: true,
    colours: [
      { name: "Havana", hex: "#7A4A21", stock: 5 },
      { name: "Black", hex: "#111111", stock: 4 },
    ],
  },
  {
    name: "FT 1077 Cat-Eye",
    slug: "tom-ford-ft-1077-cat-eye",
    brand: "tom-ford",
    category: "sunglasses",
    mrp: 48000, price: 43200,
    gender: "WOMEN", shape: "CAT_EYE", material: "ACETATE", rim: "FULL_RIM", width: 145,
    lens: "Gradient Smoke",
    description:
      "A sharply lifted cat-eye in thick Italian acetate, finished with the T-hinge in polished gold. Oversized without tipping into costume.",
    featured: true,
    isNew: true,
    colours: [
      { name: "Shiny Black", hex: "#0F0F0F", stock: 6 },
      { name: "Havana / Gold", hex: "#8B5A2B", stock: 2 },
    ],
  },
  {
    name: "GG 1287S Oversized",
    slug: "gucci-gg-1287s-oversized",
    brand: "gucci",
    category: "sunglasses",
    mrp: 36700, price: 32296,
    gender: "WOMEN", shape: "SQUARE", material: "ACETATE", rim: "FULL_RIM", width: 143,
    lens: "Brown Gradient",
    description:
      "Broad square lenses with the interlocking G at the temple. Substantial acetate, balanced so it sits light on the bridge.",
    featured: true,
    colours: [
      { name: "Ivory", hex: "#E8DCC8", stock: 4 },
      { name: "Black", hex: "#121212", stock: 7 },
      { name: "Tortoise", hex: "#6F4520", stock: 0 },
    ],
  },
  {
    name: "0PR A54S Symbole",
    slug: "prada-0pr-a54s-symbole",
    brand: "prada",
    category: "sunglasses",
    mrp: 38490, price: 34641,
    gender: "WOMEN", shape: "GEOMETRIC", material: "ACETATE", rim: "FULL_RIM", width: 142,
    lens: "Dark Grey",
    description:
      "An angular geometric front with the Symbole triangle set into the temple — one of the few genuinely new shapes of the last decade.",
    featured: true,
    isNew: true,
    colours: [
      { name: "Black", hex: "#131313", stock: 8 },
      { name: "Burgundy", hex: "#5C1F2B", stock: 3 },
    ],
  },
  {
    name: "Holbrook XL",
    slug: "oakley-holbrook-xl",
    brand: "oakley",
    category: "sunglasses",
    mrp: 16490, price: 13192,
    gender: "MEN", shape: "SPORT", material: "TR90", rim: "FULL_RIM", width: 147,
    lens: "Prizm Polarised",
    description:
      "O-Matter frame, Unobtainium earsocks, and Prizm lenses tuned to lift contrast in bright light. Built for glare, not for galleries.",
    colours: [
      { name: "Matte Black", hex: "#1C1C1C", stock: 21 },
      { name: "Woodgrain", hex: "#6A4B31", stock: 6 },
    ],
  },
  {
    name: "Champion Pilot",
    slug: "carrera-champion-pilot",
    brand: "carrera",
    category: "sunglasses",
    mrp: 14200, price: 9940,
    gender: "MEN", shape: "AVIATOR", material: "METAL", rim: "HALF_RIM", width: 141,
    lens: "Mirrored Gold",
    description:
      "A half-rim pilot with a flat-top brow bar and mirrored lenses. Carrera's racing lineage, at a price that doesn't need explaining.",
    colours: [
      { name: "Gold", hex: "#C9A227", stock: 12 },
      { name: "Matte Black", hex: "#1B1B1B", stock: 15 },
    ],
  },
  {
    name: "Aria Round Acetate",
    slug: "broadway-aria-round-acetate",
    brand: "broadway",
    category: "eyeglasses",
    mrp: 5900, price: 4425,
    gender: "UNISEX", shape: "ROUND", material: "ACETATE", rim: "FULL_RIM", width: 138,
    lens: "Single Vision (included)",
    description:
      "Our own house round, cut from Mazzucchelli acetate and hand-polished. Comes with clear single-vision lenses to your prescription at no extra cost.",
    featured: true,
    colours: [
      { name: "Honey Tortoise", hex: "#A0672E", stock: 24 },
      { name: "Smoke Grey", hex: "#5C5C5C", stock: 19 },
      { name: "Forest", hex: "#26402F", stock: 11 },
    ],
  },
  {
    name: "Meridian Titanium Rimless",
    slug: "broadway-meridian-titanium-rimless",
    brand: "broadway",
    category: "eyeglasses",
    mrp: 9900, price: 8415,
    gender: "MEN", shape: "RECTANGLE", material: "TITANIUM", rim: "RIMLESS", width: 142,
    lens: "Single Vision (included)",
    description:
      "Beta-titanium, 11 grams on the face, and no rim to interrupt the view. The frame we fit most often to people who say they hate wearing glasses.",
    featured: true,
    colours: [
      { name: "Brushed Silver", hex: "#B8BCC0", stock: 16 },
      { name: "Gunmetal", hex: "#4E5458", stock: 13 },
    ],
  },
  {
    name: "0PR 16WV Heritage",
    slug: "prada-0pr-16wv-heritage",
    brand: "prada",
    category: "eyeglasses",
    mrp: 24900, price: 21165,
    gender: "WOMEN", shape: "CAT_EYE", material: "ACETATE", rim: "FULL_RIM", width: 140,
    description:
      "A softened cat-eye optical frame with the enamelled logo plaque at the temple. Reads as a frame first and a label second.",
    isNew: true,
    colours: [
      { name: "Black", hex: "#141414", stock: 7 },
      { name: "Caramel", hex: "#9C6B3F", stock: 5 },
    ],
  },
  {
    name: "Classic Rectangle TR90",
    slug: "titan-classic-rectangle-tr90",
    brand: "titan-eye-plus",
    category: "eyeglasses",
    mrp: 3499, price: 2449,
    gender: "MEN", shape: "RECTANGLE", material: "TR90", rim: "FULL_RIM", width: 139,
    lens: "Single Vision (included)",
    description:
      "Light, flexible TR90 in a straightforward rectangle. The frame we recommend for a first pair, or a second one to leave at the office.",
    colours: [
      { name: "Matte Navy", hex: "#232F42", stock: 30 },
      { name: "Black", hex: "#1A1A1A", stock: 42 },
      { name: "Burgundy", hex: "#5A2230", stock: 17 },
    ],
  },
  {
    name: "Lumen Blue-Cut Round",
    slug: "broadway-lumen-blue-cut-round",
    brand: "broadway",
    category: "computer-glasses",
    mrp: 2999, price: 1799,
    gender: "UNISEX", shape: "ROUND", material: "TR90", rim: "FULL_RIM", width: 137,
    lens: "Blue-cut anti-glare",
    description:
      "Filters the blue end of the screen spectrum without the yellow cast cheaper coatings leave behind. Zero power by default, or to your prescription.",
    featured: true,
    isNew: true,
    colours: [
      { name: "Matte Black", hex: "#1D1D1D", stock: 58 },
      { name: "Transparent", hex: "#D8D4CC", stock: 34 },
      { name: "Rose Gold", hex: "#C88F7A", stock: 26 },
    ],
  },
  {
    name: "Lumen Blue-Cut Square",
    slug: "broadway-lumen-blue-cut-square",
    brand: "broadway",
    category: "computer-glasses",
    mrp: 2999, price: 1799,
    gender: "UNISEX", shape: "SQUARE", material: "TR90", rim: "FULL_RIM", width: 140,
    lens: "Blue-cut anti-glare",
    description:
      "The square cut of the Lumen, for faces that a round frame swallows. Same lens, same coating, same weight.",
    isNew: true,
    colours: [
      { name: "Matte Black", hex: "#1D1D1D", stock: 44 },
      { name: "Tortoise", hex: "#7B4C25", stock: 21 },
    ],
  },
  {
    name: "Oasys 1-Day (30 Lenses)",
    slug: "acuvue-oasys-1-day-30",
    brand: "acuvue",
    category: "contact-lenses",
    mrp: 2650, price: 2385,
    gender: "UNISEX",
    lens: "Daily disposable, silicone hydrogel",
    description:
      "Thirty daily lenses with HydraLuxe tear-infused technology. Supplied to your prescription — send us your power at checkout and we'll confirm before dispatch.",
    colours: [{ name: "Standard", hex: "#BFD9E8", stock: 80 }],
  },
  {
    name: "Leather Hard Case",
    slug: "broadway-leather-hard-case",
    brand: "broadway",
    category: "accessories",
    mrp: 1290, price: 990,
    gender: "UNISEX",
    description:
      "A rigid case in full-grain leather with a microfibre lining, made for us in Kanpur. Fits every frame in the catalogue, including the oversized ones.",
    colours: [
      { name: "Cognac", hex: "#8B5E34", stock: 40 },
      { name: "Black", hex: "#1A1A1A", stock: 37 },
      { name: "Forest", hex: "#26402F", stock: 22 },
    ],
  },
  {
    name: "Lens Care Kit",
    slug: "broadway-lens-care-kit",
    brand: "broadway",
    category: "accessories",
    mrp: 690, price: 490,
    gender: "UNISEX",
    description:
      "Alcohol-free spray, two microfibre cloths and a screwdriver for the temple screws that always loosen at the worst moment.",
    colours: [{ name: "Standard", hex: "#D8D4CC", stock: 65 }],
  },
];

async function main() {
  console.log("→ Categories");
  const categoryIds = new Map<string, string>();
  for (const [i, category] of CATEGORIES.entries()) {
    const row = await db.category.upsert({
      where: { slug: category.slug },
      update: { ...category, sortOrder: i },
      create: { ...category, sortOrder: i },
    });
    categoryIds.set(category.slug, row.id);
  }

  console.log("→ Brands");
  const brandIds = new Map<string, string>();
  for (const [i, brand] of BRANDS.entries()) {
    const row = await db.brand.upsert({
      where: { slug: brand.slug },
      update: { ...brand, sortOrder: i },
      create: { ...brand, sortOrder: i },
    });
    brandIds.set(brand.slug, row.id);
  }

  console.log("→ Products");
  for (const [i, seed] of PRODUCTS.entries()) {
    const categoryId = categoryIds.get(seed.category)!;
    const brandId = brandIds.get(seed.brand)!;

    const product = await db.product.upsert({
      where: { slug: seed.slug },
      update: {
        name: seed.name,
        description: seed.description,
        categoryId,
        brandId,
        mrp: seed.mrp,
        price: seed.price,
        gender: seed.gender,
        frameShape: seed.shape ?? null,
        frameMaterial: seed.material ?? null,
        frameType: seed.rim ?? null,
        frameWidthMm: seed.width ?? null,
        lensType: seed.lens ?? null,
        status: "ACTIVE",
        isFeatured: seed.featured ?? false,
        isNewArrival: seed.isNew ?? false,
        sortOrder: i,
      },
      create: {
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        categoryId,
        brandId,
        mrp: seed.mrp,
        price: seed.price,
        gender: seed.gender,
        frameShape: seed.shape ?? null,
        frameMaterial: seed.material ?? null,
        frameType: seed.rim ?? null,
        frameWidthMm: seed.width ?? null,
        lensType: seed.lens ?? null,
        status: "ACTIVE",
        isFeatured: seed.featured ?? false,
        isNewArrival: seed.isNew ?? false,
        sortOrder: i,
      },
    });

    // Images have no natural key, so they're replaced wholesale on re-seed.
    await db.productImage.deleteMany({ where: { productId: product.id } });
    await db.productImage.createMany({
      data: [
        { productId: product.id, url: SHOTS[i % SHOTS.length], alt: seed.name, sortOrder: 0 },
        { productId: product.id, url: SHOTS[(i + 3) % SHOTS.length], alt: seed.name, sortOrder: 1 },
      ],
    });

    // Variants are upserted on SKU so re-seeding never orphans an id that an
    // order item already points at.
    for (const colour of seed.colours) {
      const sku = `${seed.slug.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 14)}-${colour.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 8)}`;
      await db.productVariant.upsert({
        where: { sku },
        update: { colorName: colour.name, colorHex: colour.hex, stock: colour.stock },
        create: {
          productId: product.id,
          sku,
          colorName: colour.name,
          colorHex: colour.hex,
          stock: colour.stock,
        },
      });
    }
  }

  console.log("→ Admin account");
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@broadwayopticals.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "broadway123";
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Broadway Admin",
      password: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  console.log(`
✓ Seed complete
  ${CATEGORIES.length} categories · ${BRANDS.length} brands · ${PRODUCTS.length} products

  Admin sign-in:  ${adminEmail}
  Password:       ${adminPassword}
  (Change this before the site goes anywhere near production.)
`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
