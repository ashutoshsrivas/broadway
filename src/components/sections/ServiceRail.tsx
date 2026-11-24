import {
  Truck,
  ShieldCheck,
  Eye,
  RefreshCw,
  House,
  Clock,
  CreditCard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { TrustBoxData } from "@/lib/trust";

/**
 * The icons the shop can pick from in the admin panel.
 *
 * A fixed set rather than free text: an icon name typed by hand would be a
 * blank square on the storefront, and nobody would know why.
 */
export const TRUST_ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  eye: Eye,
  returns: RefreshCw,
  home: House,
  clock: Clock,
  card: CreditCard,
  sparkle: Sparkles,
};

export const TRUST_ICON_LABELS: Record<string, string> = {
  truck: "Delivery van",
  shield: "Shield",
  eye: "Eye",
  returns: "Returns arrows",
  home: "House",
  clock: "Clock",
  card: "Card",
  sparkle: "Sparkle",
};

/** The strip of promises. Each box is written in the admin panel. */
export function ServiceRail({ boxes }: { boxes: TrustBoxData[] }) {
  if (boxes.length === 0) return null;

  // Four boxes is the design, but the shop can keep three or add a fifth and
  // the row should still divide evenly rather than leave a gap in the last
  // column. Written as whole classes so Tailwind can see them.
  const columns =
    {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      5: "lg:grid-cols-5",
    }[Math.min(boxes.length, 5)] ?? "lg:grid-cols-4";

  return (
    <section className="border-y border-line bg-paper-raised">
      <ul
        className={`mx-auto grid max-w-[1500px] grid-cols-2 divide-line px-5 lg:divide-x lg:px-10 ${columns}`}
      >
        {boxes.map((box) => {
          const Icon = TRUST_ICONS[box.icon] ?? ShieldCheck;
          return (
            <li
              key={box.id}
              className="flex items-center gap-4 px-2 py-7 lg:justify-center lg:px-6"
            >
              <Icon className="h-6 w-6 shrink-0 text-brass" strokeWidth={1.2} />
              <div>
                <p className="label">{box.title}</p>
                {box.note && <p className="mt-1.5 text-xs text-ink-muted">{box.note}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
