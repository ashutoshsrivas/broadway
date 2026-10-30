import Link from "next/link";
import type { ExclusiveCopy } from "@/lib/exclusive";

/**
 * The notice shown on a BO Exclusive product.
 *
 * Deliberately a panel in brass rather than a warning in clay: being
 * exclusive is a reason to want the piece, not a problem with it.
 */
export function ExclusiveNotice({ copy }: { copy: ExclusiveCopy }) {
  return (
    <aside className="deco-frame mt-8 border border-brass/45 bg-brass/8 p-6 lg:p-7">
      <p className="label text-brass">◆ {copy.label}</p>
      <h2 className="display mt-3 text-2xl">{copy.title}</h2>
      <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-soft">
        {copy.message}
      </p>

      {copy.ctaLabel && copy.ctaHref && (
        <Link
          href={copy.ctaHref}
          className="label link-rule mt-5 inline-block text-ink"
        >
          {copy.ctaLabel} →
        </Link>
      )}
    </aside>
  );
}
