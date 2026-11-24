import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import type { HomeServiceContent } from "@/lib/home-service";

/**
 * The home-service band: an optician who travels to the hill towns.
 *
 * Image on the left from `lg`, stacked above the copy on a phone, which is
 * where nearly everyone reads it.
 */
export function HomeServiceBand({ content }: { content: HomeServiceContent }) {
  if (!content.enabled) return null;

  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto grid max-w-[1500px] gap-9 px-5 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-10 lg:py-20">
        <div className="deco-frame relative aspect-[4/3] overflow-hidden bg-paper-sunk lg:aspect-[5/4]">
          {content.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="label absolute inset-0 flex items-center justify-center px-6 text-center text-[0.6rem] leading-relaxed text-ink-muted">
              Placeholder — upload a home-service photograph in the admin panel
            </span>
          )}
        </div>

        <div>
          <p className="label-lg text-brass">{content.eyebrow}</p>

          <h2 className="display mt-4 text-[clamp(1.7rem,4.5vw,2.75rem)] leading-[1.1]">
            {content.heading}
          </h2>

          <p className="mt-5 max-w-lg text-[0.95rem] leading-relaxed text-ink-soft">
            {content.blurb}
          </p>

          {content.cities.length > 0 && (
            <ul className="mt-7 flex flex-wrap gap-2">
              {content.cities.map((city) => (
                <li
                  key={city}
                  className="label flex items-center gap-2 border border-line px-4 py-2.5 text-ink-soft"
                >
                  <MapPin className="h-3.5 w-3.5 text-brass" strokeWidth={1.5} />
                  {city}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/home-service" className="btn-ink label px-10 py-4">
              Book a Home Visit
            </Link>
            {content.phone && (
              <a
                href={`tel:${content.phone.replace(/[^\d+]/g, "")}`}
                className="btn-outline label flex items-center gap-2 px-10 py-4"
              >
                <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                {content.phone}
              </a>
            )}
          </div>

          {content.isPlaceholder && (
            <p className="label mt-5 text-[0.55rem] text-clay">
              Placeholder copy — replace it in Admin → Homepage → Home Service
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
