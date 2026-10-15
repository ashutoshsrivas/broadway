import Link from "next/link";

const AUDIENCES = [
  { label: "Men", href: "/shop?gender=MEN" },
  { label: "Women", href: "/shop?gender=WOMEN" },
  { label: "Kids", href: "/shop?gender=KIDS" },
];

/**
 * Asymmetric hero: the headline holds the left two-thirds and the portrait
 * breaks the grid on the right, overlapped by a brass rule so the two columns
 * read as one composition rather than a split screen.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-paper grain">
      <div className="mx-auto grid max-w-[1500px] items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-24">
        <div className="stagger relative z-10">
          <p className="label-lg text-brass">Est. 1974 · New Delhi</p>

          <h1 className="display mt-6 text-[clamp(2.75rem,7vw,5.25rem)]">
            See, and
            <br />
            be <em className="text-brass">seen.</em>
          </h1>

          <p className="mt-7 max-w-md text-[0.95rem] leading-relaxed text-ink-soft">
            Fifty years of lens craft behind every frame we sell. Browse the houses that define
            modern eyewear — then let our opticians fit it to your face, exactly.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn-ink label px-10 py-4">
              Shop All Frames
            </Link>
            <Link href="/stores" className="btn-outline label px-10 py-4">
              Book an Eye Test
            </Link>
          </div>

          <div className="mt-12">
            <p className="label mb-3 text-ink-muted">Shopping for</p>
            <ul className="flex gap-2">
              {AUDIENCES.map((audience) => (
                <li key={audience.label}>
                  <Link
                    href={audience.href}
                    className="label block border border-line px-6 py-3 text-ink-soft transition-colors hover:border-ink hover:text-ink"
                  >
                    {audience.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Portrait — pushed past the container edge on large screens. */}
        <div className="relative animate-rise [animation-delay:200ms] lg:-mr-10">
          <div className="deco-frame relative aspect-[4/5] overflow-hidden bg-paper-sunk lg:aspect-[5/6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1605813808456-26c16c0dfb77?w=1200&q=80&auto=format&fit=crop"
              alt="A model wearing oversized cat-eye sunglasses"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>

          {/* Caption card overlapping the image corner. */}
          <figcaption className="absolute -bottom-5 left-4 max-w-[15rem] border border-line bg-paper-raised px-6 py-5 lg:-left-10">
            <p className="label text-brass">Now Showing</p>
            <p className="display mt-2 text-xl leading-tight">The Autumn Frame Edit</p>
            <Link href="/shop?sort=newest" className="label link-rule mt-3 inline-block text-ink-soft">
              View the edit →
            </Link>
          </figcaption>
        </div>
      </div>

      <hr className="rule-deco mx-auto max-w-[1500px]" />
    </section>
  );
}
