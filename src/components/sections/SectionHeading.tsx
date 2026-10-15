import Link from "next/link";

/**
 * Every section on the site is introduced the same way: a brass eyebrow, a
 * Bodoni title, and an optional link ruled off to the right. Keeping it in one
 * component is what makes the page read as a single publication.
 */
export function SectionHeading({
  eyebrow,
  title,
  blurb,
  href,
  hrefLabel = "View all",
  align = "left",
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb?: string;
  href?: string;
  hrefLabel?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      className={`flex flex-wrap items-end gap-4 ${
        centered ? "flex-col items-center text-center" : "justify-between"
      }`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-xl"}>
        <p className="label text-brass">{eyebrow}</p>
        <h2 className="display mt-3 text-[clamp(1.85rem,4vw,3rem)]">{title}</h2>
        {blurb && <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">{blurb}</p>}
      </div>

      {href && (
        <Link href={href} className="label link-rule shrink-0 pb-1 text-ink-soft">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
