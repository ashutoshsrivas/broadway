import { Truck, ShieldCheck, Eye, RefreshCw } from "lucide-react";

const SERVICES = [
  { icon: Truck, title: "Free Shipping", note: "On every order above ₹2,000" },
  { icon: ShieldCheck, title: "100% Authentic", note: "Brand warranty on every frame" },
  { icon: Eye, title: "Free Eye Test", note: "At all Broadway stores" },
  { icon: RefreshCw, title: "14-Day Returns", note: "Unworn frames, no questions" },
];

export function ServiceRail() {
  return (
    <section className="border-y border-line bg-paper-raised">
      <ul className="mx-auto grid max-w-[1500px] grid-cols-2 divide-line px-5 lg:grid-cols-4 lg:divide-x lg:px-10">
        {SERVICES.map(({ icon: Icon, title, note }) => (
          <li key={title} className="flex items-center gap-4 px-2 py-7 lg:justify-center lg:px-6">
            <Icon className="h-6 w-6 shrink-0 text-brass" strokeWidth={1.2} />
            <div>
              <p className="label">{title}</p>
              <p className="mt-1.5 text-xs text-ink-muted">{note}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
