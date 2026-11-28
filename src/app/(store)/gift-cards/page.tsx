import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { GiftCardBuilder } from "@/components/store/GiftCardBuilder";

export const metadata: Metadata = {
  title: "Gift Cards",
  description:
    "A Broadway gift card for any amount — spend it on any frame, in store or online. Worth exactly what you pay for it.",
};

const POINTS = [
  {
    title: "Any amount",
    body: "From ₹500 upward. Pick a round figure or the exact one you had in mind.",
  },
  {
    title: "Spends like money",
    body: "Against any frame, any house, online or at the counter. Whatever is left stays on the card for next time.",
  },
  {
    title: "Worth what you paid",
    body: "A card's balance is set from the amount paid and only ever goes down. No surprises in either direction.",
  },
];

export default function GiftCardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gift Cards"
        title="Let them choose the frame."
        blurb="The one present nobody has to pretend to like. Any amount, spendable on anything we sell."
      />

      <section className="mx-auto max-w-[1500px] px-5 pb-16 lg:px-10 lg:pb-20">
        <GiftCardBuilder />
      </section>

      <section className="border-y border-line bg-[var(--color-accent-butter)]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 lg:px-10 lg:py-16">
          <ul className="grid gap-9 lg:grid-cols-3 lg:gap-12">
            {POINTS.map((point) => (
              <li key={point.title}>
                <h2 className="label text-brass">{point.title}</h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
