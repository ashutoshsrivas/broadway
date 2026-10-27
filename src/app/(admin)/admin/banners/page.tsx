import { db } from "@/lib/db";
import { BannerManager } from "@/components/admin/BannerManager";
import { DiscoverManager } from "@/components/admin/DiscoverManager";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const [banners, panels] = await Promise.all([
    db.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    db.discoverPanel.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const totalMs = banners
    .filter((b) => b.isActive)
    .reduce((sum, b) => sum + b.durationMs, 0);

  return (
    <>
      <p className="label text-brass">Storefront</p>
      <h1 className="display mt-3 text-4xl">Homepage</h1>
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

      <h2 className="label-lg mb-5">Hero Banners</h2>
      <BannerManager initial={banners} />

      <section className="mt-16">
        <h2 className="label-lg">Discover Panels</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
          The split band below the arrivals deck — usually one panel for him and one for her.
          Each links into its corner of the shop. The thumbnail carries the panel while the video
          loads, and stands in entirely for a panel without one.
        </p>
        <hr className="rule-deco mt-5 mb-6" />
        <DiscoverManager initial={panels} />
      </section>
    </>
  );
}
