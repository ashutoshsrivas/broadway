import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getPromo } from "@/lib/promo";
import { getNavLinks } from "@/lib/nav";
import { WelcomeOffer } from "@/components/store/WelcomeOffer";

// The catalogue changes from the admin panel, so the storefront renders per
// request rather than being frozen at build time.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here and handed to the client header, so the nav needs no
  // round-trip of its own.
  const [navLinks, promo] = await Promise.all([getNavLinks(), getPromo()]);

  return (
    <>
      <AnnouncementBar />
      <Header navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WelcomeOffer promo={promo} />
    </>
  );
}
