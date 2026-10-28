import { Instagram as InstagramGlyph } from "@/components/Icons";

export type InstaPost = {
  id: string;
  imageUrl: string;
  href: string | null;
  caption: string | null;
};

/**
 * The shop's Instagram, as a profile-style band.
 *
 * The images are uploaded rather than pulled from Instagram's API: a Basic
 * Display token has to be refreshed every 60 days and takes the whole band
 * down with it when nobody does. The shop posts there and uploads the good
 * ones here; each tile links back to the real post.
 */
export function InstagramBand({
  posts,
  handle,
  profileUrl,
  heading,
}: {
  posts: InstaPost[];
  handle: string;
  profileUrl: string;
  heading?: string;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="border-b border-line bg-paper-raised">
      <div className="mx-auto max-w-[1500px] px-5 py-20 lg:px-10 lg:py-24">
        <div className="flex flex-col items-center text-center">
          {heading && <p className="label text-brass">{heading}</p>}

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-4 inline-flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper text-ink transition-colors group-hover:border-brass group-hover:text-brass">
              <InstagramGlyph className="h-5 w-5" />
            </span>
            <span className="display text-2xl transition-colors group-hover:text-brass">
              {handle}
            </span>
          </a>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
            Fittings, new arrivals and the occasional look behind the counter.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
          {posts.map((post) => (
            <li key={post.id}>
              <a
                href={post.href || profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden bg-paper-sunk"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt={post.caption ?? ""}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* The glyph only appears on hover, so the grid reads as
                    photographs first and as links second. */}
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/45 group-hover:opacity-100">
                  <InstagramGlyph className="h-6 w-6 text-paper" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline label inline-block px-12 py-4"
          >
            Follow {handle}
          </a>
        </div>
      </div>
    </section>
  );
}
