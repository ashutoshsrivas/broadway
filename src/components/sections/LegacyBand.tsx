import Link from "next/link";

const MILESTONES = [
  { figure: "1974", label: "First counter, Connaught Place" },
  { figure: "50+", label: "Years of lens craft" },
  { figure: "80+", label: "Houses represented" },
  { figure: "6", label: "Stores across Delhi NCR" },
];

/**
 * The full-bleed forest band. One dark interruption in an otherwise cream page
 * gives the scroll a centre of gravity — and it is where the shop's story,
 * rather than its stock, gets to speak.
 */
export function LegacyBand() {
  return (
    <section className="relative overflow-hidden bg-forest text-paper grain">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-10 lg:py-28">
        <div className="deco-frame relative aspect-[5/4] overflow-hidden lg:order-last">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1517948430535-1e2469d314fe?w=1200&q=80&auto=format&fit=crop"
            alt="A pair of eyeglasses held up against an optician’s eye chart"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <p className="label-lg text-brass">Our Legacy</p>
          <h2 className="display mt-5 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05]">
            Fifty years of
            <br />
            <em className="text-brass-soft">looking closer.</em>
          </h2>

          <p className="mt-6 max-w-lg text-[0.95rem] leading-relaxed text-paper/70">
            Broadway began in 1974 as a single counter in Connaught Place, grinding lenses by hand
            for a city that was still learning to read fine print. Five decades on, the craft has
            not changed — only the instruments have. Every frame that leaves us is still fitted by
            an optician who measures your face before they sell you anything.
          </p>

          <dl className="mt-11 grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4">
            {MILESTONES.map((milestone) => (
              <div key={milestone.figure} className="border-t border-paper/20 pt-4">
                <dt className="display text-3xl text-brass-soft">{milestone.figure}</dt>
                <dd className="mt-2 text-xs leading-relaxed text-paper/55">{milestone.label}</dd>
              </div>
            ))}
          </dl>

          <Link
            href="/about"
            className="label link-rule mt-11 inline-block text-brass-soft"
          >
            Read our story →
          </Link>
        </div>
      </div>
    </section>
  );
}
