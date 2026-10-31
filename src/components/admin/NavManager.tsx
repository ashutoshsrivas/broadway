"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

type Link = {
  id: string;
  label: string;
  href: string;
  highlight: boolean;
  newTab: boolean;
  sortOrder: number;
  isActive: boolean;
};

export function NavManager({ initial }: { initial: Link[] }) {
  const router = useRouter();
  const [links, setLinks] = useState(initial);
  const [draft, setDraft] = useState({ label: "", href: "" });
  const [busy, setBusy] = useState(false);

  const patch = async (id: string, data: Partial<Link>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...data } : l)));
    const res = await fetch(`/api/admin/nav/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  /** Swap with a neighbour and persist both positions. */
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;

    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = next.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLinks(renumbered);

    await Promise.all(
      [renumbered[index], renumbered[target]].map((l) =>
        fetch(`/api/admin/nav/${l.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: l.sortOrder }),
        })
      )
    );
    router.refresh();
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.label.trim() || !draft.href.trim()) return;

    setBusy(true);
    const res = await fetch("/api/admin/nav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not add the link.");
      return;
    }
    setLinks((prev) => [...prev, data.link]);
    setDraft({ label: "", href: "" });
    toast.success("Link added");
    router.refresh();
  };

  const remove = async (link: Link) => {
    if (!window.confirm(`Remove “${link.label}” from the navbar?`)) return;
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    await fetch(`/api/admin/nav/${link.id}`, { method: "DELETE" });
    toast.success("Link removed");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {links.length > 0 && (
        <ul className="divide-y divide-line border border-line bg-paper-raised">
          {links.map((link, i) => (
            <li
              key={link.id}
              className={`flex flex-wrap items-end gap-4 p-4 ${link.isActive ? "" : "opacity-55"}`}
            >
              <label className="block">
                <span className="label text-[0.55rem] text-ink-muted">Label</span>
                <input
                  defaultValue={link.label}
                  onBlur={(e) => {
                    const label = e.target.value.trim();
                    if (label && label !== link.label) void patch(link.id, { label });
                  }}
                  className="field-box mt-1 w-40"
                />
              </label>

              <label className="block flex-1">
                <span className="label text-[0.55rem] text-ink-muted">Links to</span>
                <input
                  defaultValue={link.href}
                  onBlur={(e) => {
                    const href = e.target.value.trim();
                    if (href && href !== link.href) void patch(link.id, { href });
                  }}
                  className="field-box mt-1 min-w-[12rem]"
                />
              </label>

              <label className="label flex cursor-pointer items-center gap-2 pb-2.5 text-ink-soft">
                <input
                  type="checkbox"
                  checked={link.highlight}
                  onChange={(e) => void patch(link.id, { highlight: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[#B08D4F]"
                />
                Brass
              </label>

              <label className="label flex cursor-pointer items-center gap-2 pb-2.5 text-ink-soft">
                <input
                  type="checkbox"
                  checked={link.newTab}
                  onChange={(e) => void patch(link.id, { newTab: e.target.checked })}
                  className="h-3.5 w-3.5 accent-[#B08D4F]"
                />
                New tab
              </label>

              <div className="flex gap-1 pb-1">
                <button
                  onClick={() => void patch(link.id, { isActive: !link.isActive })}
                  title={link.isActive ? "Hide" : "Show"}
                  className="p-2 text-ink-muted transition-colors hover:text-brass"
                >
                  {link.isActive ? (
                    <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                  )}
                </button>
                <button
                  onClick={() => void move(i, -1)}
                  disabled={i === 0}
                  title="Move left"
                  className="p-2 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                >
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void move(i, 1)}
                  disabled={i === links.length - 1}
                  title="Move right"
                  className="p-2 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                >
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => void remove(link)}
                  title="Remove"
                  className="p-2 text-ink-muted transition-colors hover:text-clay"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={create} className="flex flex-wrap items-end gap-3 border-t border-line pt-5">
        <label className="block">
          <span className="label text-ink-muted">Label</span>
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
            placeholder="Sunglasses"
            className="field-box mt-1.5 w-44"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Links to</span>
          <input
            value={draft.href}
            onChange={(e) => setDraft({ ...draft, href: e.target.value })}
            placeholder="/shop?category=sunglasses"
            className="field-box mt-1.5 w-64"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !draft.label.trim() || !draft.href.trim()}
          className="btn-ink label flex items-center gap-2 px-7 py-3"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          {busy ? "Adding…" : "Add Link"}
        </button>
      </form>
    </div>
  );
}
