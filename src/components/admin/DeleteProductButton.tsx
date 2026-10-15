"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    // Deleting a product is irreversible, so it takes an explicit confirmation
    // naming the product.
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;

    setBusy(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      // The usual cause is order history, which the API explains in its message.
      toast.error(data.error ?? "Could not delete the product.");
      return;
    }

    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <button onClick={handleDelete} disabled={busy} className="label text-ink-muted hover:text-clay">
      {busy ? "…" : "Delete"}
    </button>
  );
}
