import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusPill } from "@/components/account/OrderStatusPill";

export default async function OrdersPage() {
  const session = await auth();

  // Scoped to the signed-in user in the query itself — there is no order id in
  // the URL to tamper with.
  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: { select: { id: true, productName: true, variantLabel: true, quantity: true, totalPrice: true, imageUrl: true } },
    },
  });

  if (orders.length === 0) {
    return (
      <div className="border border-line bg-paper-raised px-7 py-20 text-center">
        <p className="display text-3xl">No orders yet</p>
        <p className="mt-3 text-sm text-ink-soft">Your order history will appear here.</p>
        <Link href="/shop" className="btn-ink label mt-8 inline-block px-10 py-4">
          Browse Frames
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-6">
      {orders.map((order) => (
        <li
          key={order.id}
          id={order.orderNumber}
          className="border border-line bg-paper-raised scroll-mt-36"
        >
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <p className="font-display text-xl">{order.orderNumber}</p>
              <p className="mt-1 text-xs text-ink-muted">
                {order.createdAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <OrderStatusPill status={order.paymentStatus} />
              <OrderStatusPill status={order.status} />
            </div>
          </header>

          <ul className="divide-y divide-line px-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden bg-paper-sunk">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base">{item.productName}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {item.variantLabel} · Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm">{formatPrice(item.totalPrice)}</span>
              </li>
            ))}
          </ul>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-6 py-5">
            <p className="text-xs leading-relaxed text-ink-muted">
              Shipping to {order.line1}, {order.city}, {order.state} {order.pincode}
            </p>
            <p className="flex items-baseline gap-3">
              <span className="label text-ink-muted">Total</span>
              <span className="font-display text-xl">{formatPrice(order.total)}</span>
            </p>
          </footer>
        </li>
      ))}
    </ul>
  );
}
