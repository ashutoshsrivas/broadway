"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { TRUST_ICONS, TRUST_ICON_LABELS } from "@/components/sections/ServiceRail";

export type TrustRow = {
  id: string;
  icon: string;
  title: string;
  note: string | null;
  sortOrder: number;
  isActive: boolean;
};

/**
 * The four promises in the strip, editable.
 *
 * The shop said one of the four would be replaced but not which, so all four
 * are editable instead — the wording, the note under it and the icon. Nothing
 * here needs a developer.
 */
export function TrustBoxManager({ initial }: { initial: TrustRow[] }) {
  const router = useRouter();
  const [boxes, setBoxes] = useState(initial);
  const [adding, setAdding] = useState(false);

  const patch = async (id: string, data: Partial<TrustRow>) => {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    const res = await fetch(`/api/admin/trust-boxes/${id}`, {
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

  const create = async () => {
    setAdding(true);
    const res = await fetch("/api/admin/trust-boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icon: "sparkle", title: "New promise" }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not add the box.");
      return;
    }
    setBoxes((prev) => [...prev, data.box]);
    router.refresh();
  };

  const remove = async (id: string) => {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/admin/trust-boxes/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {boxes.map((box) => {
          const Icon = TRUST_ICONS[box.icon] ?? TRUST_ICONS.shield;
          return (
            <li
              key={box.id}
              className={`border bg-paper-raised p-5 ${
                box.isActive ? "border-line" : "border-dashed border-line opacity-55"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-brass" strokeWidth={1.2} />
                <select
                  value={box.icon}
                  onChange={(e) => void patch(box.id, { icon: e.target.value })}
                  className="field-box !text-xs"
                  aria-label="Icon"
                >
                  {Object.keys(TRUST_ICONS).map((key) => (
                    <option key={key} value={key}>
                      {TRUST_ICON_LABELS[key] ?? key}
                    </option>
                  ))}
                </select>
              </div>

              <input
                defaultValue={box.title}
                onBlur={(e) => {
                  const title = e.target.value.trim();
                  if (title && title !== box.title) void patch(box.id, { title });
                }}
                placeholder="Free Shipping"
                className="field-box mt-3 !text-xs"
              />
              <input
                defaultValue={box.note ?? ""}
                onBlur={(e) => {
                  const note = e.target.value.trim();
                  if (note !== (box.note ?? "")) void patch(box.id, { note: note || null });
                }}
                placeholder="On every order above ₹2,000"
                className="field-box mt-2.5 !text-xs"
              />

              <div className="mt-3 flex items-center justify-end gap-1 border-t border-line pt-3">
                <button
                  onClick={() => void patch(box.id, { isActive: !box.isActive })}
                  title={box.isActive ? "Hide" : "Show"}
                  className="p-1.5 text-ink-muted transition-colors hover:text-brass"
                >
                  {box.isActive ? (
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                </button>
                <button
                  onClick={() => void remove(box.id)}
                  title="Delete"
                  className="p-1.5 text-ink-muted transition-colors hover:text-clay"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => void create()}
        disabled={adding}
        className="btn-outline label flex items-center gap-2 px-7 py-3"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2} />
        {adding ? "Adding…" : "Add a Box"}
      </button>
      <p className="-mt-2 text-xs text-ink-muted">
        Four boxes is the design. Three or five still divide the row evenly, but the strip is
        tighter to read beyond five.
      </p>
    </div>
  );
}
