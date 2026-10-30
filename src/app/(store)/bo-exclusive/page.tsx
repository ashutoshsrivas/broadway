import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { productCardSelect } from "@/lib/catalog";
import { EXCLUSIVE_WHERE, exclusiveCopy } from "@/lib/exclusive";
import { getSettings } from "@/lib/settings";
import { ProductCard } from "@/components/store/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const copy = exclusiveCopy(await getSettings());
  return {
    title: copy.label,
    description: copy.message.slice(0, 160),
  };
}

export default async function ExclusivePage() {
  const [products, settings] = await Promise.all([
    db.product.findMany({
      where: { status: "ACTIVE", ...EXCLUSIVE_WHERE },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: productCardSelect,
    }),
    getSettings(),
  ]);

  const copy = exclusiveCopy(settings);

  return (
    <>
      <header className="border-b border-line bg-ink text-paper grain">
        <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
          <nav className="label mb-8 flex items-center gap-2 text-paper/50" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-paper">
              Home
            </Link>
            <span className="text-brass">/</span>
            <span className="text-paper">{copy.label}</span>
          </nav>

          <p className="label-lg text-brass">◆ {copy.label}</p>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2.25rem,6vw,4rem)]">{copy.title}</h1>
          <p className="mt-6 max-w-2xl whitespace-pre-line text-[1.05rem] leading-relaxed text-paper/70">
            {copy.message}
          </p>

          {copy.ctaLabel && copy.ctaHref && (
            <Link href={copy.ctaHref} className="label mt-9 inline-block bg-paper px-10 py-4 text-ink transition-colors hover:bg-brass">
              {copy.ctaLabel}
            </Link>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-16 lg:px-10 lg:py-20">
        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="display text-3xl">Nothing in the selection yet.</p>
            <p className="mt-3 text-sm text-ink-soft">
              Mark a product or a whole department as {copy.label} and it will appear here.
            </p>
            <Link href="/shop" className="btn-ink label mt-8 inline-block px-10 py-4">
              Browse All Frames
            </Link>
          </div>
        ) : (
          <>
            <p className="label mb-10 text-ink-muted">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 lg:gap-x-7">
              {products.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={i < 6} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
