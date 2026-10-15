import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Terms of Service" title="Terms of service" />
      <Prose>
        <p>
          These terms govern your use of broadwayopticals.com and any purchase you make through it.
          By placing an order you accept them.
        </p>

        <h2>Orders and pricing</h2>
        <p>
          All prices are in Indian Rupees and include applicable taxes. We price every order on our
          own servers at the moment it is placed — the amount shown at checkout is what you pay. If
          a product is listed at an obviously incorrect price, we may cancel the order and refund
          you in full rather than fulfil it.
        </p>

        <h2>Prescriptions</h2>
        <p>
          Prescription lenses are made to the power you supply or to the reading taken at one of our
          stores. Please make sure any prescription you send us is current and complete. We may call
          to confirm details before cutting lenses.
        </p>

        <h2>Availability</h2>
        <p>
          Stock is held per colourway and can sell out between the moment you add a frame to your
          bag and the moment you check out. If we cannot fulfil an order we will contact you and
          refund it in full.
        </p>

        <h2>Authenticity</h2>
        <p>
          Every frame we sell is sourced from the brand or its authorised Indian distributor and
          carries the manufacturer&rsquo;s warranty.
        </p>

        <h2>Your account</h2>
        <p>
          You are responsible for keeping your password confidential. Tell us at once if you think
          someone else has used your account.
        </p>

        <h2>Governing law</h2>
        <p>
          These terms are governed by the laws of India, and the courts at New Delhi have exclusive
          jurisdiction over any dispute arising from them.
        </p>
      </Prose>
    </>
  );
}
