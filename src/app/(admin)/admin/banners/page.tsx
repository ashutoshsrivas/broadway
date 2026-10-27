import { db } from "@/lib/db";
import { BannerManager } from "@/components/admin/BannerManager";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await db.banner.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const totalMs = banners
    .filter((b) => b.isActive)
    .reduce((sum, b) => sum + b.durationMs, 0);

  return (
    <>
      <p className="label text-brass">Storefront</p>
      <h1 className="display mt-3 text-4xl">Hero Banners</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
        The full-screen deck at the top of the homepage. Slides run in the order below and loop.
        {banners.filter((b) => b.isActive).length > 0 && (
          <>
            {" "}
            One full cycle currently takes{" "}
            <strong className="text-ink">{(totalMs / 1000).toFixed(1)}s</strong>.
          </>
        )}
      </p>
      <hr className="rule-deco mt-6 mb-8" />

      <BannerManager initial={banners} />
    </>
  );
}
