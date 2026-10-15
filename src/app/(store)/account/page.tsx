import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusPill } from "@/components/account/OrderStatusPill";

export default async function AccountPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [orderCount, addressCount, recent] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.address.count({ where: { userId } }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        items: { select: { id: true }, take: 1 },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-12">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-paper-raised p-7">
          <dt className="label text-ink-muted">Orders placed</dt>
          <dd className="display mt-3 text-4xl">{orderCount}</dd>
        </div>
        <div className="border border-line bg-paper-raised p-7">
          <dt className="label text-ink-muted">Saved addresses</dt>
          <dd className="display mt-3 text-4xl">{addressCount}</dd>
        </div>
      </dl>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="label-lg">Recent Orders</h2>
          {orderCount > 0 && (
            <Link href="/account/orders" className="label link-rule text-ink-muted">
              View all →
            </Link>
          )}
        </div>
        <hr className="rule-deco mt-4 mb-6" />

        {recent.length === 0 ? (
          <div className="border border-line bg-paper-raised px-7 py-14 text-center">
            <p className="display text-2xl">No orders yet</p>
            <p className="mt-2.5 text-sm text-ink-soft">
              When you buy your first pair, it&rsquo;ll show up here.
            </p>
            <Link href="/shop" className="btn-ink label mt-7 inline-block px-9 py-3.5">
              Browse Frames
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {recent.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders#${order.orderNumber}`}
                  className="flex flex-wrap items-center justify-between gap-4 py-5 transition-colors hover:text-brass"
                >
                  <div>
                    <p className="font-display text-lg">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {order.createdAt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      · {order._count.items} item{order._count.items === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <OrderStatusPill status={order.status} />
                    <span className="text-sm">{formatPrice(order.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
