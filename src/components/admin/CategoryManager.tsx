"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { NumberField } from "@/components/admin/NumberField";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isBoExclusive: boolean;
  showOnHome: boolean;
  showInMenu: boolean;
  gstPercent: number | null;
  productCount: number;
};

/**
 * Departments, with the three things the shop changes about them: whether the
 * whole department is BO Exclusive, whether it gets a box on the homepage,
 * and the GST it is charged at.
 *
 * Each control saves on change rather than behind a form button — this screen
 * is a set of switches, and a Save button on a screen of switches is one more
 * thing to forget.
 */
export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(categories);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const patch = async (id: string, data: Partial<CategoryRow>) => {
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
      return;
    }
    router.refresh();
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not save.");
      return;
    }

    setName("");
    toast.success("Category added");
    router.refresh();
  };

  return (
    <section className="border border-line bg-paper-raised p-6 lg:p-7">
      <h2 className="label-lg">Categories</h2>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-ink-muted">
        The departments products are filed under. A category with products cannot be deleted.
        GST is charged per department — sunglasses are 18%; optical frames are seeded at 12% and
        should be confirmed with your accountant. Leave it blank to charge nothing.
      </p>
      <hr className="rule-deco mt-4 mb-6" />

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">None yet.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base">
                  {row.name}
                  {!row.isActive && <span className="label ml-3 text-brass">Hidden</span>}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">
                  {row.slug} · {row.productCount} product{row.productCount === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:shrink-0">
                <label className="label flex items-center gap-2 text-ink-muted">
                  <span>GST</span>
                  <NumberField
                    value={row.gstPercent ?? ""}
                    onCommit={(value) =>
                      void patch(row.id, {
                        gstPercent: value === "" ? null : Number(value),
                      })
                    }
                    min={0}
                    max={50}
                    placeholder="—"
                    className="field-box w-20 !text-xs"
                    aria-label={`GST percentage for ${row.name}`}
                  />
                  <span>%</span>
                </label>

                <label className="label flex cursor-pointer items-center gap-2 text-ink-muted">
                  <input
                    type="checkbox"
                    checked={row.showInMenu}
                    onChange={(e) => void patch(row.id, { showInMenu: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#B08D4F]"
                  />
                  Menu dropdown
                </label>

                <label className="label flex cursor-pointer items-center gap-2 text-ink-muted">
                  <input
                    type="checkbox"
                    checked={row.showOnHome}
                    onChange={(e) => void patch(row.id, { showOnHome: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#B08D4F]"
                  />
                  Homepage box
                </label>

                <label className="label flex cursor-pointer items-center gap-2 text-ink-muted">
                  <input
                    type="checkbox"
                    checked={row.isBoExclusive}
                    onChange={(e) => void patch(row.id, { isBoExclusive: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[#B08D4F]"
                  />
                  BO Exclusive
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={create} className="mt-6 flex flex-wrap items-end gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sunglasses"
          className="field-box w-56"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="btn-ink label flex items-center gap-2 px-7 py-3.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {busy ? "Adding…" : "Add Category"}
        </button>
      </form>
    </section>
  );
}
