import type { Metadata } from "next";
import { PageHeader, Prose } from "@/components/PageHeader";

export const metadata: Metadata = { title: "Shipping" };

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Shipping"
        title="Getting your frames to you"
        blurb="Complimentary on orders above ₹2,000. Everything else is a flat ₹99."
      />
      <Prose>
        <h2>Dispatch</h2>
        <p>
          Ready-to-wear frames and sunglasses leave our Delhi warehouse within{" "}
          <strong>1–2 working days</strong>. Orders that need prescription lenses are cut to your
          power first and dispatch in <strong>4–7 working days</strong> — our team will call to
          confirm your prescription before we start.
        </p>

        <h2>Delivery times</h2>
        <ul>
          <li>Delhi NCR — 1–2 working days after dispatch</li>
          <li>Metro cities — 2–4 working days</li>
          <li>Rest of India — 4–7 working days</li>
        </ul>

        <h2>Charges</h2>
        <p>
          Shipping is <strong>complimentary on every order above ₹2,000</strong>. Below that, a
          flat ₹99 applies, shown at checkout before you pay.
        </p>

        <h2>Tracking</h2>
        <p>
          You&rsquo;ll get a tracking link by SMS and email the moment your parcel is handed to the
          courier. You can also see the current status of every order under{" "}
          <a href="/account/orders">My Orders</a>.
        </p>

        <h2>Cash on Delivery</h2>
        <p>
          Available across India on orders up to ₹50,000. Please keep the exact amount ready — our
          couriers cannot always make change.
        </p>
      </Prose>
    </>
  );
}
