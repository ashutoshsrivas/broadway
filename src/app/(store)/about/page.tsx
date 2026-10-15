import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Fifty years of lens craft, from a single counter in Connaught Place.",
};

const CHAPTERS = [
  {
    year: "1974",
    title: "One counter, one lathe",
    body: "Broadway opened as a single optical counter on the Outer Circle, grinding lenses by hand for a city that was still learning to read fine print. The lathe from that first year is still in the New Delhi store.",
  },
  {
    year: "1991",
    title: "The houses arrive",
    body: "As India opened up, so did our shelves. Broadway became one of the first retailers in the capital to carry European frames, and the first to insist every pair be fitted before it left the shop.",
  },
  {
    year: "2008",
    title: "Precision, digitised",
    body: "Digital surfacing replaced the hand lathe for progressive lenses — the same craft, measured to a hundredth of a dioptre. The opticians who ran the lathe learned the new machines.",
  },
  {
    year: "Today",
    title: "Six stores, one standard",
    body: "Six stores across Delhi NCR and a catalogue that ships nationwide. Whatever you buy online, an optician still measures your face before your lenses are cut.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title={
          <>
            Fifty years of <em>looking closer.</em>
          </>
        }
        blurb="Broadway Opticals has fitted eyewear in New Delhi since 1974. The instruments have changed. The standard hasn't."
      />

      <div className="mx-auto max-w-[1500px] px-5 lg:px-10">
        <div className="relative aspect-[21/9] overflow-hidden bg-paper-sunk">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1534078477103-9f6a18b3a5e2?w=1800&q=80&auto=format&fit=crop"
            alt="A wall of eyewear frames in the Broadway Opticals showroom"
            className="h-full w-full object-cover"
          />
        </div>

        <ol className="mt-20 grid gap-x-12 gap-y-14 pb-24 md:grid-cols-2">
          {CHAPTERS.map((chapter) => (
            <li key={chapter.year} className="border-t border-line pt-7">
              <p className="display text-4xl text-brass">{chapter.year}</p>
              <h2 className="display mt-4 text-2xl">{chapter.title}</h2>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">{chapter.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <section className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center">
          <p className="label text-brass">Come and See</p>
          <h2 className="display mt-4 text-[clamp(1.85rem,4vw,3rem)]">
            The fitting is the <em>whole thing</em>.
          </h2>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
            Book a complimentary eye test at any Broadway store and let an optician measure what a
            website never can.
          </p>
          <Link href="/stores" className="btn-ink label mt-9 inline-block px-10 py-4">
            Find a Store
          </Link>
        </div>
      </section>
    </>
  );
}
