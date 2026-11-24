import Link from "next/link";
import { MapPin, Phone, Clock, House } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getSettings } from "@/lib/settings";
import { getHomeService } from "@/lib/home-service";
import { getTrustBoxes } from "@/lib/trust";
import { ServiceRail } from "@/components/sections/ServiceRail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Home Service · Broadway Opticals",
  description:
    "An optician, the trial set and the frame tray, at your own table — across Dehradun, Rishikesh and Haridwar.",
};

const STEPS = [
  {
    icon: Phone,
    title: "Tell us when",
    note: "Call or message with a time that suits the household.",
  },
  {
    icon: House,
    title: "We come to you",
    note: "An optician arrives with the testing kit and a tray of frames.",
  },
  {
    icon: Clock,
    title: "Fitted and delivered",
    note: "Lenses are cut at our lab and the finished glasses come back to you.",
  },
];

export default async function HomeServicePage() {
  const settings = await getSettings();
  const content = getHomeService(settings);
  const boxes = await getTrustBoxes();

  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.heading} blurb={content.blurb} />

      <section className="mx-auto max-w-[1500px] px-5 py-14 lg:px-10 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className="label-lg text-brass">How it works</h2>
            <ul className="mt-7 space-y-7">
              {STEPS.map(({ icon: Icon, title, note }, i) => (
                <li key={title} className="flex gap-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line bg-paper-raised text-brass">
                    <Icon className="h-5 w-5" strokeWidth={1.3} />
                  </span>
                  <div>
                    <p className="label">
                      <span className="mr-2.5 text-ink-muted">{String(i + 1).padStart(2, "0")}</span>
                      {title}
                    </p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{note}</p>
                  </div>
                </li>
              ))}
            </ul>

            <hr className="rule-deco my-10" />

            {/* The shop's own words about the service. Until they arrive this
                is a labelled stand-in, not copy pretending to be theirs. */}
            <div className="space-y-4 text-[0.95rem] leading-relaxed text-ink-soft">
              {content.body.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {content.isPlaceholder && (
              <p className="label mt-6 border border-dashed border-clay/40 px-4 py-3 text-[0.55rem] leading-relaxed text-clay">
                Placeholder copy. Paste the home-service wording from the current website into
                Admin → Homepage → Home Service and this page updates itself.
              </p>
            )}
          </div>

          <aside className="border border-line bg-paper-raised p-7 lg:p-9">
            <p className="label text-brass">Where we travel</p>

            {content.cities.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {content.cities.map((city) => (
                  <li key={city} className="flex items-center gap-3 border-b border-line pb-3 text-sm text-ink-soft">
                    <MapPin className="h-4 w-4 shrink-0 text-brass" strokeWidth={1.4} />
                    {city}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm text-ink-muted">Towns to be confirmed.</p>
            )}

            <p className="mt-7 text-sm leading-relaxed text-ink-soft">
              Outside these towns, ask us anyway — we travel for a full household.
            </p>

            <div className="mt-8 space-y-3">
              {content.phone && (
                <a
                  href={`tel:${content.phone.replace(/[^\d+]/g, "")}`}
                  className="btn-ink label flex items-center justify-center gap-2 px-8 py-4"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {content.phone}
                </a>
              )}
              <Link
                href="/contact"
                className="btn-outline label flex items-center justify-center px-8 py-4"
              >
                Send an Enquiry
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <ServiceRail boxes={boxes} />
    </>
  );
}
