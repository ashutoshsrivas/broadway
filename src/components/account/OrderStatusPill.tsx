import { titleCase } from "@/lib/utils";

// Colour carries meaning here: brass = settled, clay = needs attention,
// muted = still moving through the shop.
const TONE: Record<string, string> = {
  PENDING: "border-line text-ink-muted",
  CONFIRMED: "border-brass/50 text-brass",
  PROCESSING: "border-brass/50 text-brass",
  SHIPPED: "border-forest/40 text-forest",
  DELIVERED: "border-forest bg-forest text-paper",
  CANCELLED: "border-clay/50 text-clay",
  PAID: "border-forest/40 text-forest",
  FAILED: "border-clay/50 text-clay",
  REFUNDED: "border-line text-ink-muted",
};

export function OrderStatusPill({ status }: { status: string }) {
  return (
    <span className={`label border px-3 py-1.5 ${TONE[status] ?? "border-line text-ink-muted"}`}>
      {titleCase(status)}
    </span>
  );
}
