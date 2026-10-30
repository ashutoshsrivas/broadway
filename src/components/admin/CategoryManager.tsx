"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isBoExclusive: boolean;
  productCount: number;
};
export function CategoryManager({ categories }: { categories: Category[] }) {
  return (
    <div>
      <Panel
        title="Categories"
        note="The departments in the header. A category with products cannot be deleted."
        endpoint="/api/admin/categories"
        placeholder="Sunglasses"
        rows={categories.map((category) => ({
          id: category.id,
          name: category.name,
          meta: `${category.slug} · ${category.productCount} product${
            category.productCount === 1 ? "" : "s"
          }`,
          flag: category.isActive ? null : "Hidden",
          toggle: { field: "isBoExclusive" as const, on: category.isBoExclusive },
        }))}
      />

    </div>
  );
}

function Panel({
  title,
  note,
  endpoint,
  placeholder,
  rows,
  featurable = false,
}: {
  title: string;
  note: string;
  endpoint: string;
  placeholder: string;
  rows: {
    id: string;
    name: string;
    meta: string;
    flag: string | null;
    toggle?: { field: "showInNewArrivals" | "isBoExclusive"; on: boolean };
  }[];
  featurable?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [featured, setFeatured] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        featurable ? { name: name.trim(), isFeatured: featured } : { name: name.trim() }
      ),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not save.");
      return;
    }

    setName("");
    setFeatured(false);
    toast.success(`${title.replace(/s$/, "")} added`);
    router.refresh();
  };

  return (
    <section className="border border-line bg-paper-raised p-6 lg:p-7">
      <h2 className="label-lg">{title}</h2>
      <p className="mt-2 text-xs leading-relaxed text-ink-muted">{note}</p>
      <hr className="rule-deco mt-4 mb-6" />

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">None yet.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <p className="truncate font-display text-base">{row.name}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">{row.meta}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {row.flag && <span className="label text-brass">{row.flag}</span>}
                {row.toggle && (
                  <label className="label flex cursor-pointer items-center gap-2 text-ink-muted">
                    <input
                      type="checkbox"
                      defaultChecked={row.toggle.on}
                      onChange={async (e) => {
                        const res = await fetch(`${endpoint}/${row.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ [row.toggle!.field]: e.target.checked }),
                        });
                        if (!res.ok) {
                          toast.error("Could not save that change.");
                          e.target.checked = !e.target.checked;
                          return;
                        }
                        router.refresh();
                      }}
                      className="h-3.5 w-3.5 accent-[#B08D4F]"
                    />
                    {row.toggle.field === "isBoExclusive" ? "BO Exclusive" : "Arrivals deck"}
                  </label>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="mt-6 space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="field-box"
        />

        {featurable && (
          <label className="flex items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 accent-[#B08D4F]"
            />
            Feature on the homepage
          </label>
        )}

        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="btn-ink label flex items-center gap-2 px-7 py-3.5"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {busy ? "Adding…" : `Add ${title.replace(/s$/, "")}`}
        </button>
      </form>
    </section>
  );
}
