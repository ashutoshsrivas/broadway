import Link from "next/link";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Order Confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  // Looked up by order number alone so a guest can see their own confirmation.
  // Only non-sensitive summary fields are selected.
  const order = orderNumber
    ? await db.order.findUnique({
        where: { orderNumber },
        select: {
          orderNumber: true,
          name: true,
          email: true,
          city: true,
          state: true,
          total: true,
          paymentMethod: true,
          paymentStatus: true,
          createdAt: true,
          items: {
            select: { id: true, productName: true, variantLabel: true, quantity: true, totalPrice: true },
          },
        },
      })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center lg:py-28">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brass">
        <Check className="h-7 w-7 text-brass" strokeWidth={1.5} />
      </span>

      <p className="label mt-8 text-brass">Thank you</p>
      <h1 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)]">
        Your order is <em>confirmed</em>
      </h1>

      {order ? (
        <>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-ink-soft">
            We&rsquo;ve sent the details to <strong className="text-ink">{order.email}</strong>. Our
            team will call you to confirm your prescription before dispatch.
          </p>

          <div className="deco-frame mt-10 border border-line bg-paper-raised p-7 text-left">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <p className="label text-ink-muted">Order number</p>
                <p className="display mt-1.5 text-2xl">{order.orderNumber}</p>
              </div>
              <span className="label border border-line px-3 py-2 text-ink-soft">
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : order.paymentStatus === "PAID"
                    ? "Paid Online"
                    : "Payment Pending"}
              </span>
            </div>

            <hr className="rule-deco my-6" />

            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{item.productName}</span>
                    <span className="text-xs text-ink-muted">
                      {item.variantLabel} · Qty {item.quantity}
                    </span>
                  </span>
                  <span className="shrink-0">{formatPrice(item.totalPrice)}</span>
                </li>
              ))}
            </ul>

            <hr className="rule-deco my-6" />

            <div className="flex items-baseline justify-between">
              <span className="label">Total</span>
              <span className="font-display text-2xl">{formatPrice(order.total)}</span>
            </div>

            <p className="mt-5 text-xs text-ink-muted">
              Shipping to {order.city}, {order.state}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-5 text-[0.95rem] text-ink-soft">
          We couldn&rsquo;t find that order reference. If you were charged, please contact us and
          we&rsquo;ll sort it out straight away.
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn-ink label px-10 py-4">
          Continue Shopping
        </Link>
        <Link href="/account/orders" className="btn-outline label px-10 py-4">
          View My Orders
        </Link>
      </div>
    </div>
  );
}
