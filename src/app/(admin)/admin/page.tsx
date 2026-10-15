import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { OrderStatusPill } from "@/components/account/OrderStatusPill";

export default async function AdminDashboard() {
  const [orderCount, pendingCount, productCount, lowStock, revenue, recent] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
    db.product.count({ where: { status: "ACTIVE" } }),
    db.productVariant.count({ where: { stock: { lte: 3 } } }),
    // Revenue counts only money actually collected — pending and failed
    // payments would otherwise inflate the figure.
    db.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        name: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Revenue collected", value: formatPrice(revenue._sum.total ?? 0) },
    { label: "Total orders", value: orderCount },
    { label: "Awaiting dispatch", value: pendingCount },
    { label: "Live products", value: productCount },
  ];

  return (
    <>
      <p className="label text-brass">Overview</p>
      <h1 className="display mt-3 text-4xl">Dashboard</h1>
      <hr className="rule-deco mt-6 mb-8" />

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line bg-paper-raised p-6">
            <dt className="label text-ink-muted">{stat.label}</dt>
            <dd className="display mt-3 text-3xl">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {lowStock > 0 && (
        <p className="mt-6 border border-clay/40 bg-clay/5 px-5 py-4 text-sm text-clay">
          <strong>{lowStock}</strong> colourway{lowStock === 1 ? " has" : "s have"} 3 or fewer units
          left.{" "}
          <Link href="/admin/products" className="underline">
            Review stock
          </Link>
        </p>
      )}

      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="label-lg">Recent Orders</h2>
          <Link href="/admin/orders" className="label link-rule text-ink-muted">
            View all →
          </Link>
        </div>
        <hr className="rule-deco mt-4 mb-6" />

        {recent.length === 0 ? (
          <p className="border border-line bg-paper-raised px-6 py-12 text-center text-sm text-ink-muted">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-line bg-paper-raised">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line">
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th align="right">Total</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td className="px-5 py-3.5">
                      <Link href="/admin/orders" className="font-display text-base hover:text-brass">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink-soft">{order.name}</td>
                    <td className="px-5 py-3.5 text-ink-muted">
                      {order.createdAt.toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusPill status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <OrderStatusPill status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">{formatPrice(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`label px-5 py-3.5 text-ink-muted ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
