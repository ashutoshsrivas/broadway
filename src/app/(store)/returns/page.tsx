import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Returns & Exchange" };

export default function ReturnsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Returns & Exchange"
        title="If it isn't right, send it back"
        blurb="Fourteen days on unworn frames, and a free re-fit at any store for as long as you own them."
      />
      <Prose>
        <h2>The 14-day window</h2>
        <p>
          Return any unworn frame within <strong>14 days of delivery</strong> for a full refund or
          an exchange. The frame must come back in its original case with the tags and brand
          paperwork intact.
        </p>

        <h2>What we can&rsquo;t take back</h2>
        <ul>
          <li>Frames fitted with prescription lenses cut to your power</li>
          <li>Contact lenses, once the seal is broken</li>
          <li>Anything showing wear, scratches or damage</li>
        </ul>
        <p>
          Prescription lenses are ground for one person&rsquo;s eyes and cannot be resold — that is
          why they are final sale. If the power is wrong because of an error on our side, we remake
          them free.
        </p>

        <h2>How to start a return</h2>
        <p>
          Call us on +91 11 2341 2345 or email{" "}
          <a href="mailto:care@broadwayopticals.com">care@broadwayopticals.com</a> with your order
          number. We&rsquo;ll arrange a pickup where the courier serves, or you can walk into any
          Broadway store.
        </p>

        <h2>Refunds</h2>
        <p>
          Once your return reaches us and passes inspection, refunds are issued to the original
          payment method within <strong>5–7 working days</strong>. Cash-on-delivery orders are
          refunded by bank transfer.
        </p>

        <h2>Free adjustments, forever</h2>
        <p>
          Any frame bought from Broadway can be cleaned, tightened and re-fitted free at any of our
          stores, for as long as you own it. No receipt needed.
        </p>
      </Prose>
    </>
  );
}
