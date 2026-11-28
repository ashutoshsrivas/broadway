import { formatPrice } from "@/lib/utils";

/**
 * The card itself: maroon, with a loose doodle of spectacles repeating
 * across it under the type.
 *
 * The doodle is an inline SVG pattern rather than an image — it has to tile
 * at any card size, stay crisp on a phone, and take the brass colour from
 * the theme, and a raster would fail all three. The pattern id is suffixed
 * so two cards on one page cannot collide in the SVG id namespace.
 */
export function GiftCardArt({
  value,
  code,
  recipientName,
  senderName,
  message,
  id = "gc",
}: {
  value: number;
  code?: string | null;
  recipientName?: string | null;
  senderName?: string | null;
  message?: string | null;
  id?: string;
}) {
  const patternId = `specs-${id}`;

  return (
    <div
      className="relative isolate aspect-[1.586/1] w-full overflow-hidden rounded-[14px] text-paper shadow-[0_26px_50px_-30px_rgba(42,31,23,0.75)]"
      style={{ backgroundColor: "#6B1A24" }}
    >
      {/* The doodle. Low contrast on purpose — it is a texture, and the
          figures on top have to stay readable over it. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ opacity: 0.17 }}
      >
        <defs>
          <pattern
            id={patternId}
            width="108"
            height="78"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-12)"
          >
            <g
              fill="none"
              stroke="#E8C98A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Round pair */}
              <circle cx="22" cy="22" r="9" />
              <circle cx="48" cy="22" r="9" />
              <path d="M31 22 h8" />
              <path d="M13 19 L5 15" />
              <path d="M57 19 L65 15" />

              {/* Square pair, offset into the gap so the tile reads as a
                  scattered doodle rather than a grid. */}
              <rect x="63" y="52" width="18" height="13" rx="3" />
              <rect x="86" y="52" width="18" height="13" rx="3" />
              <path d="M81 58 h5" />
              <path d="M63 56 L56 52" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* A hairline inset, like a printed card's edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 rounded-[8px] border"
        style={{ borderColor: "rgba(232,201,138,0.35)" }}
      />

      <div className="relative flex h-full flex-col justify-between p-6 lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="display text-lg leading-none tracking-[0.08em]">BROADWAY</p>
            <p className="label mt-1 text-[0.5rem]" style={{ color: "#E8C98A" }}>
              Opticals
            </p>
          </div>
          <p className="label text-[0.55rem]" style={{ color: "#E8C98A" }}>
            Gift Card
          </p>
        </div>

        <div>
          <p className="display text-[clamp(1.9rem,6vw,2.75rem)] leading-none">
            {formatPrice(value)}
          </p>

          {recipientName && (
            <p className="label mt-3 text-[0.6rem] text-paper/75">For {recipientName}</p>
          )}
          {message && (
            <p className="mt-2 line-clamp-2 max-w-[22rem] text-xs italic leading-relaxed text-paper/65">
              “{message}”
            </p>
          )}
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="label text-[0.6rem] tracking-[0.22em]" style={{ color: "#E8C98A" }}>
            {code ?? "BO-••••-••••"}
          </p>
          {senderName && (
            <p className="label text-right text-[0.55rem] text-paper/60">from {senderName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
