import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusPill } from "@/components/account/OrderStatusPill";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      items: { select: { id: true, productName: true, variantLabel: true, quantity: true, totalPrice: true } },
    },
  });

  return (
    <>
      <p className="label text-brass">Fulfilment</p>
      <h1 className="display mt-3 text-4xl">Orders</h1>
      <p className="label mt-3 text-ink-muted">
        {orders.length} most recent
      </p>
      <hr className="rule-deco mt-6 mb-8" />

      {orders.length === 0 ? (
        <p className="border border-line bg-paper-raised px-6 py-20 text-center text-sm text-ink-muted">
          No orders yet.
        </p>
      ) : (
        <ul className="space-y-5">
          {orders.map((order) => (
            <li key={order.id} className="border border-line bg-paper-raised">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-6 py-5">
                <div>
                  <p className="font-display text-xl">{order.orderNumber}</p>
                  <p className="mt-1.5 text-sm text-ink-soft">
                    {order.name} · {order.phone}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {order.email} ·{" "}
                    {order.createdAt.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-display text-2xl">{formatPrice(order.total)}</p>
                  <p className="label mt-1.5 text-ink-muted">
                    {order.paymentMethod === "COD" ? "Cash on Delivery" : "Razorpay"}
                  </p>
                </div>
              </header>

              <div className="grid gap-6 px-6 py-5 lg:grid-cols-[1.6fr_1fr]">
                <div>
                  <h3 className="label text-ink-muted">Items</h3>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-4 py-2.5 text-sm">
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

                  <h3 className="label mt-5 text-ink-muted">Ship to</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {order.line1}
                    {order.line2 && <>, {order.line2}</>}
                    <br />
                    {order.city}, {order.state} {order.pincode}
                  </p>

                  {order.notes && (
                    <>
                      <h3 className="label mt-5 text-ink-muted">Customer notes</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                        {order.notes}
                      </p>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="label text-ink-muted">Current</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OrderStatusPill status={order.paymentStatus} />
                    <OrderStatusPill status={order.status} />
                  </div>

                  <OrderStatusControl
                    id={order.id}
                    status={order.status}
                    paymentStatus={order.paymentStatus}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
