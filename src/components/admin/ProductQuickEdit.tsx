"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { NumberField } from "@/components/admin/NumberField";
import { formatPrice, discountPct } from "@/lib/utils";

/**
 * The price and stock cells of the product list, editable in place.
 *
 * Both save on blur rather than behind a button: this screen is used for
 * running down a column correcting numbers, and a Save per row is one more
 * thing to forget. A rejected change is rolled back on screen, so the cell
 * never shows a number the database does not hold.
 */
const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export function ProductQuickEdit({
  id,
  price,
  mrp,
  stock,
  status,
  variantCount,
}: {
  id: string;
  price: number;
  mrp: number;
  stock: number;
  status: string;
  variantCount: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState({ price, stock, status });
  const [busy, setBusy] = useState(false);

  const save = async (patch: { price?: number; stock?: number; status?: string }) => {
    const before = values;
    setValues((v) => ({ ...v, ...patch }));
    setBusy(true);

    const res = await fetch(`/api/admin/products/${id}/quick`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not save that.");
      setValues(before);
      return;
    }

    setValues({ price: data.price, stock: data.stock, status: data.status });
    toast.success("Saved");
    router.refresh();
  };

  const save_ = discountPct(mrp, values.price);

  return (
    <>
      <td className="px-5 py-3.5 text-right">
        <span className="flex items-center justify-end gap-2">
          <NumberField
            value={values.price}
            min={0}
            max={mrp}
            disabled={busy}
            onCommit={(v) => {
              const next = Number(v);
              if (!Number.isFinite(next) || next === values.price) return;
              void save({ price: next });
            }}
            aria-label="Selling price"
            className="field-box w-28 text-right !text-xs"
          />
        </span>
        {save_ > 0 && (
          <span className="mt-1 block text-xs text-ink-muted">
            <span className="line-through">{formatPrice(mrp)}</span>
            <span className="ml-2 text-clay">Save {save_}%</span>
          </span>
        )}
      </td>

      <td className="px-5 py-3.5 text-right">
        {variantCount === 1 ? (
          <NumberField
            value={values.stock}
            decimals={false}
            min={0}
            disabled={busy}
            onCommit={(v) => {
              const next = Number(v);
              if (!Number.isFinite(next) || next === values.stock) return;
              void save({ stock: next });
            }}
            aria-label="Stock"
            className={`field-box w-20 text-right !text-xs ${
              values.stock === 0 ? "!text-clay" : ""
            }`}
          />
        ) : (
          // Several colourways: there is no honest single number to write, so
          // the total is shown and the edit happens where the colours are.
          <Link
            href={`/admin/products/${id}`}
            className={`label tabular-nums hover:text-brass ${
              values.stock === 0 ? "text-clay" : ""
            }`}
            title={`${variantCount} colourways — set stock on the product page`}
          >
            {values.stock}
            <span className="ml-1.5 text-[0.55rem] text-ink-muted">
              / {variantCount} cols
            </span>
          </Link>
        )}
      </td>

      <td className="px-5 py-3.5">
        {/* Draft and back is the switch the shop reaches for most — taking a
            frame off sale while a photograph is reshot, or putting one live
            the moment it lands. */}
        <select
          value={values.status}
          disabled={busy}
          onChange={(e) => void save({ status: e.target.value })}
          aria-label="Status"
          className={`field-box !text-xs ${
            values.status === "ACTIVE"
              ? "!text-forest"
              : values.status === "ARCHIVED"
                ? "!text-clay"
                : "!text-ink-muted"
          }`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
    </>
  );
}
