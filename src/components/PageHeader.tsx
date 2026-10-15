import Link from "next/link";

/** Shared masthead for every editorial and policy page. */
export function PageHeader({
  eyebrow,
  title,
  blurb,
}: {
  eyebrow: string;
  title: React.ReactNode;
  blurb?: string;
}) {
  return (
    <header className="mx-auto max-w-[1500px] px-5 pb-10 pt-12 lg:px-10 lg:pt-16">
      <nav className="label mb-7 flex items-center gap-2 text-ink-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span className="text-brass">/</span>
        <span className="text-ink">{eyebrow}</span>
      </nav>

      <p className="label text-brass">{eyebrow}</p>
      <h1 className="display mt-3 max-w-3xl text-[clamp(2.25rem,6vw,4rem)]">{title}</h1>
      {blurb && <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ink-soft">{blurb}</p>}
      <hr className="rule-deco mt-10" />
    </header>
  );
}

/**
 * Policy-page body type. Narrow measure, generous leading, and headings that
 * match the rest of the site without needing a class on every element.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto max-w-3xl px-5 pb-24 text-[0.95rem] leading-[1.8] text-ink-soft
        [&_a]:text-brass [&_a]:underline
        [&_h2]:display [&_h2]:mb-4 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:text-ink
        [&_li]:mb-2 [&_p]:mb-5 [&_strong]:text-ink
        [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5"
    >
      {children}
    </div>
  );
}
