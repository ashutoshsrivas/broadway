import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isRazorpayConfigured } from "@/lib/razorpay";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Guest checkout is allowed. A signed-in shopper just gets their details
  // filled in for them.
  const session = await auth();
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="display text-[clamp(2rem,5vw,3.25rem)]">Checkout</h1>
      <hr className="rule-deco mt-6 mb-10" />

      <CheckoutForm
        prefill={{
          name: user?.name ?? "",
          email: user?.email ?? "",
          phone: user?.phone ?? "",
        }}
        onlinePaymentAvailable={isRazorpayConfigured()}
      />
    </div>
  );
}
