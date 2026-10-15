import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy Policy" title="How we handle your data" />
      <Prose>
        <h2>What we collect</h2>
        <p>
          When you buy from us we collect your name, email, phone number and shipping address, and
          the details of what you ordered. If you send us a prescription, we hold that too. When you
          create an account we store your password only as a one-way hash — we cannot read it.
        </p>

        <h2>Payments</h2>
        <p>
          Online payments are handled entirely by <strong>Razorpay</strong>. Your card, UPI and
          banking details go to them, never to us — we only ever see a payment reference and whether
          the payment succeeded.
        </p>

        <h2>What we use it for</h2>
        <ul>
          <li>Fulfilling and delivering your order</li>
          <li>Confirming your prescription before we cut lenses</li>
          <li>Handling returns, exchanges and warranty claims</li>
          <li>Answering you when you contact us</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          Only the couriers who deliver your order and the payment gateway that takes your money.
          We do not sell your data, and we do not share it for anyone else&rsquo;s advertising.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Order records are kept as long as Indian tax and accounting law requires. You can ask us
          to delete your account and any data we are not legally required to keep.
        </p>

        <h2>Your choices</h2>
        <p>
          Write to <a href="mailto:care@broadwayopticals.com">care@broadwayopticals.com</a> to see,
          correct or delete the data we hold about you.
        </p>
      </Prose>
    </>
  );
}
