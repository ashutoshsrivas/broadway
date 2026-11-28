import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getHomeService } from "@/lib/home-service";
import { getTrustBoxes } from "@/lib/trust";
import { getContact } from "@/lib/contact";
import { ServiceRail } from "@/components/sections/ServiceRail";
import { Reveal } from "@/components/store/Reveal";
import { DeliveryJourney } from "@/components/sections/DeliveryJourney";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Broadway at Home",
  description:
    "An optometrist and the season's frames, brought to your own table — across Dehradun, Haridwar, Rishikesh and Mussoorie.",
};

/** The three beats of the visit. Written here rather than in the admin
 *  because they describe how the service works, not what it says. */
const CHAPTERS = [
  {
    numeral: "I",
    title: "You tell us when",
    body: "One call or a message on WhatsApp. We ask who is being fitted, roughly what they are after, and when the household is free — nothing more.",
  },
  {
    numeral: "II",
    title: "We arrive with the shop",
    body: "An optometrist and one of our team, carrying the testing equipment and a tray of the season's frames. The examination is the one you would get at the counter; the mirror is your own.",
  },
  {
    numeral: "III",
    title: "The glasses come back finished",
    body: "Lenses are cut and fitted at our lab, and the finished pair is delivered to the same address. Adjustments afterwards are free, for as long as you own the frame.",
  },
];

export default async function BroadwayAtHomePage() {
  const settings = await getSettings();
  const content = getHomeService(settings);
  const contact = getContact(settings);
  const boxes = await getTrustBoxes();

  const callNumber = content.phone ?? contact.phone;
  const waDigits = (content.whatsapp ?? content.phone ?? "").replace(/\D/g, "");
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        "Hello Broadway — I'd like to book a home appointment."
      )}`
    : null;

  return (
    <>
      {/* ───────────────────────── The opening ─────────────────────────
          The photograph drifts against the scroll behind the title. It sits
          in its own clipping box so the oversized, moving layer cannot push
          the page sideways. */}
      <section className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 overflow-hidden">
          {content.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.heroImageUrl}
              alt=""
              fetchPriority="high"
              className="parallax-layer h-full w-full object-cover"
              style={{ ["--parallax-depth" as string]: "9%" }}
            />
          ) : (
            <span className="label absolute inset-0 flex items-center justify-center px-8 text-center text-[0.6rem] text-paper/35">
              Placeholder — upload a hero photograph in the admin panel
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35" />
        </div>

        <div className="relative mx-auto w-full max-w-[1500px] px-5 pb-16 pt-[calc(var(--header-h,6rem)+3rem)] lg:px-10 lg:pb-24">
          <Reveal>
            <p className="label-lg text-brass-soft">{content.eyebrow}</p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="display mt-5 max-w-3xl text-[clamp(2.4rem,7vw,5rem)] leading-[1.02]">
              {content.heading}
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 max-w-xl text-[1.05rem] leading-relaxed text-paper/75">
              {content.blurb}
            </p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap gap-3">
              {callNumber && (
                <a
                  href={`tel:${callNumber.replace(/[^\d+]/g, "")}`}
                  className="label flex items-center gap-2.5 bg-paper px-9 py-4 text-ink transition-colors hover:bg-brass"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.6} />
                  Call to book
                </a>
              )}
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label flex items-center gap-2.5 border border-paper/60 px-9 py-4 text-paper transition-colors hover:bg-paper hover:text-ink"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.6} />
                  WhatsApp us
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Where we travel ───────────────────────── */}
      {content.cities.length > 0 && (
        <section className="border-b border-line bg-[var(--color-accent-butter)]">
          <div className="mx-auto max-w-[1500px] px-5 py-12 lg:px-10 lg:py-14">
            <Reveal>
              <p className="label text-center text-ink-muted">We travel to</p>
            </Reveal>
            <ul className="mt-7 flex flex-wrap justify-center gap-x-10 gap-y-4 lg:gap-x-16">
              {content.cities.map((city, i) => (
                <Reveal as="li" key={city} delay={i * 90}>
                  <span className="display text-[clamp(1.4rem,3.5vw,2.4rem)] text-ink">
                    {city}
                  </span>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={200}>
              <p className="mt-7 text-center text-sm text-ink-soft">
                Somewhere else in the hills? Ask us anyway — we travel for a full household.
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ───────────────────────── The visit, in three ─────────────────────────
          Numbered like chapters, each sliding up as it is reached. */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-28">
          <Reveal>
            <p className="label text-brass">How a visit goes</p>
            <h2 className="display mt-4 max-w-2xl text-[clamp(1.9rem,4.5vw,3rem)] leading-[1.1]">
              Three steps, and none of them are yours.
            </h2>
          </Reveal>

          <ol className="mt-14 grid gap-12 lg:grid-cols-3 lg:gap-10">
            {CHAPTERS.map((chapter, i) => (
              <Reveal as="li" key={chapter.numeral} delay={i * 140}>
                <p className="display text-5xl text-brass/35 lg:text-6xl">{chapter.numeral}</p>
                <hr className="mt-5 border-0 border-t border-line" />
                <h3 className="label-lg mt-6">{chapter.title}</h3>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                  {chapter.body}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────────────── The journey ───────────────────────── */}
      <DeliveryJourney />

      {/* ───────────────────────── The second plate ─────────────────────────
          A full-bleed band with its own drift, to break the reading. */}
      <section className="relative isolate overflow-hidden bg-forest text-paper">
        <div className="absolute inset-0 overflow-hidden">
          {content.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt=""
              loading="lazy"
              className="parallax-layer h-full w-full object-cover opacity-40"
              style={{ ["--parallax-depth" as string]: "14%" }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-forest/90 via-forest/70 to-ink/85" />
        </div>

        <div className="relative mx-auto max-w-3xl px-5 py-24 text-center lg:px-10 lg:py-32">
          <Reveal>
            <p className="label-lg text-brass-soft">Since 1960</p>
            <p className="display mt-6 text-[clamp(1.6rem,4vw,2.6rem)] leading-[1.25]">
              A boutique on the Mall at Mussoorie, in the foothills — and, for fifty years, an
              optician willing to carry it down the hill to you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── The shop's own words ───────────────────────── */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-10 lg:py-24">
          <Reveal>
            <h2 className="display text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.1]">
              What to expect
            </h2>
            <p className="label mt-6 text-ink-muted">
              {contact.hours}
            </p>
          </Reveal>

          <Reveal delay={140}>
            <div className="space-y-5 text-[1rem] leading-relaxed text-ink-soft">
              {content.body.split(/\n{2,}/).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {content.isPlaceholder && (
              <p className="label mt-7 border border-dashed border-clay/40 px-5 py-4 text-[0.55rem] leading-relaxed text-clay">
                Placeholder copy. Paste the shop&rsquo;s own wording into Admin → Homepage →
                Home Service and this page updates itself.
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* ───────────────────────── Book ───────────────────────── */}
      <section className="border-b border-line bg-[var(--color-accent-blush)]">
        <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-24">
          <Reveal>
            <div className="deco-frame border border-line bg-paper-raised px-6 py-14 text-center lg:px-16 lg:py-20">
              <p className="label text-brass">Book a home appointment</p>
              <h2 className="display mx-auto mt-5 max-w-2xl text-[clamp(1.8rem,4.5vw,3rem)] leading-[1.1]">
                Pick a time. We will bring the rest.
              </h2>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {callNumber && (
                  <a
                    href={`tel:${callNumber.replace(/[^\d+]/g, "")}`}
                    className="btn-ink label flex items-center gap-2.5 px-10 py-4"
                  >
                    <Phone className="h-3.5 w-3.5" strokeWidth={1.6} />
                    {callNumber}
                  </a>
                )}
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline label flex items-center gap-2.5 px-10 py-4"
                  >
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.6} />
                    WhatsApp
                  </a>
                )}
              </div>

              <dl className="mx-auto mt-12 grid max-w-2xl gap-6 border-t border-line pt-10 text-sm sm:grid-cols-3">
                <div>
                  <dt className="label flex items-center justify-center gap-2 text-ink-muted">
                    <MapPin className="h-3.5 w-3.5 text-brass" strokeWidth={1.5} />
                    Store
                  </dt>
                  <dd className="mt-2.5 leading-relaxed text-ink-soft">{contact.address}</dd>
                </div>
                <div>
                  <dt className="label flex items-center justify-center gap-2 text-ink-muted">
                    <Clock className="h-3.5 w-3.5 text-brass" strokeWidth={1.5} />
                    Open
                  </dt>
                  <dd className="mt-2.5 leading-relaxed text-ink-soft">{contact.hours}</dd>
                </div>
                <div>
                  <dt className="label flex items-center justify-center gap-2 text-ink-muted">
                    <Phone className="h-3.5 w-3.5 text-brass" strokeWidth={1.5} />
                    Or email
                  </dt>
                  <dd className="mt-2.5 leading-relaxed text-ink-soft">
                    <a href={`mailto:${contact.email}`} className="hover:text-brass">
                      {contact.email}
                    </a>
                  </dd>
                </div>
              </dl>

              <p className="mt-10 text-sm text-ink-muted">
                Would rather come in?{" "}
                <Link href="/stores" className="link-rule text-ink">
                  Find the store
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <ServiceRail boxes={boxes} />
    </>
  );
}
