import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getPromo } from "@/lib/promo";
import { getMenu } from "@/lib/menu";
import { SETTING_KEYS, getSettings, settingOn } from "@/lib/settings";
import { getContact } from "@/lib/contact";
import { WelcomeOffer } from "@/components/store/WelcomeOffer";

// The catalogue changes from the admin panel, so the storefront renders per
// request rather than being frozen at build time.
export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // Fetched once here and handed to the client header, so the nav needs no
  // round-trip of its own.
  const [navLinks, promo, settings] = await Promise.all([
    getMenu(),
    getPromo(),
    getSettings(),
  ]);

  const announcementOn = settingOn(settings, SETTING_KEYS.announcementEnabled);
  const notices = (settings[SETTING_KEYS.announcementNotices] ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      {announcementOn && <AnnouncementBar notices={notices} />}
      <Header navLinks={navLinks} />
      <main className="flex-1">{children}</main>
      <Footer contact={getContact(settings)} />
      <CartDrawer />
      <WelcomeOffer promo={promo} />
    </>
  );
}
