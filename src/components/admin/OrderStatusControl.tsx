"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { titleCase } from "@/lib/utils";

const ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

export function OrderStatusControl({
  id,
  status,
  paymentStatus,
}: {
  id: string;
  status: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const update = async (patch: { status?: string; paymentStatus?: string }) => {
    // Cancelling returns the stock to the shelf server-side, which is not
    // obvious from a dropdown — so it asks first.
    if (patch.status === "CANCELLED" && !window.confirm("Cancel this order and restock its items?")) {
      return;
    }

    setBusy(true);
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not update the order.");
      return;
    }

    toast.success("Order updated");
    router.refresh();
  };

  return (
    <div className="mt-6 space-y-4">
      <label className="block">
        <span className="label text-ink-muted">Order status</span>
        <select
          value={status}
          disabled={busy}
          onChange={(e) => update({ status: e.target.value })}
          className="field-box mt-1.5"
        >
          {ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="label text-ink-muted">Payment status</span>
        <select
          value={paymentStatus}
          disabled={busy}
          onChange={(e) => update({ paymentStatus: e.target.value })}
          className="field-box mt-1.5"
        >
          {PAYMENT_STATUSES.map((option) => (
            <option key={option} value={option}>
              {titleCase(option)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
