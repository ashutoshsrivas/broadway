import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { db } from "@/lib/db";
import { getPromo } from "@/lib/promo";
import { WelcomeOffer } from "@/components/store/WelcomeOffer";

// The catalogue changes from the admin panel, so the storefront renders per
// request rather than being frozen at build time.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here and handed to the client header, so the nav needs no
  // round-trip of its own.
  const [categories, promo] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { name: true, slug: true },
    }),
    getPromo(),
  ]);

  return (
    <>
      <AnnouncementBar />
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WelcomeOffer promo={promo} />
    </>
  );
}
