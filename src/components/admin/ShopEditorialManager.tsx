"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";

type Editorial = {
  id: string;
  imageUrl: string;
  eyebrow: string | null;
  heading: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function ShopEditorialManager({
  initial,
  everyRows,
  settingKey,
}: {
  initial: Editorial[];
  everyRows: string;
  settingKey: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [rows, setRows] = useState(everyRows || "3");
  const [savingRows, setSavingRows] = useState(false);

  const saveRows = async (value: string) => {
    setSavingRows(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [settingKey]: value }),
    });
    setSavingRows(false);
    if (!res.ok) {
      toast.error("Could not save.");
      return;
    }
    toast.success("Spacing saved");
    router.refresh();
  };

  const patch = async (id: string, data: Partial<Editorial>) => {
    setItems((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
    const res = await fetch(`/api/admin/shop-editorial/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body });
      const data = await up.json().catch(() => ({}));
      if (!up.ok) {
        toast.error(data.error ?? `Could not upload ${file.name}`);
        continue;
      }

      const res = await fetch("/api/admin/shop-editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.url }),
      });
      const created = await res.json().catch(() => ({}));
      if (res.ok) setItems((prev) => [...prev, created.editorial]);
    }

    setUploading(false);
    router.refresh();
  };

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((e) => e.id !== id));
    await fetch(`/api/admin/shop-editorial/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4 border border-line bg-paper-raised p-5">
        <label className="block">
          <span className="label text-ink-muted">Rows of product between images</span>
          <select
            value={rows}
            onChange={(e) => {
              setRows(e.target.value);
              void saveRows(e.target.value);
            }}
            disabled={savingRows}
            className="field-box mt-1.5 w-28"
          >
            <option value="2">Every 2</option>
            <option value="3">Every 3</option>
            <option value="4">Every 4</option>
            <option value="5">Every 5</option>
          </select>
        </label>
        <p className="flex-1 text-xs leading-relaxed text-ink-muted">
          Images are placed in list order and alternate sides down the page — first left, then
          right, then left. Each one is two columns wide and two rows tall.
        </p>
      </div>

      {items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <li
              key={e.id}
              className={`border bg-paper-raised ${
                e.isActive ? "border-line" : "border-dashed border-line opacity-55"
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-sunk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>

              <div className="space-y-3 p-4">
                <input
                  defaultValue={e.eyebrow ?? ""}
                  onBlur={(ev) => {
                    const eyebrow = ev.target.value.trim();
                    if (eyebrow !== (e.eyebrow ?? "")) void patch(e.id, { eyebrow: eyebrow || null });
                  }}
                  placeholder="Eyebrow"
                  className="field-box !text-xs"
                />
                <input
                  defaultValue={e.heading ?? ""}
                  onBlur={(ev) => {
                    const heading = ev.target.value.trim();
                    if (heading !== (e.heading ?? "")) void patch(e.id, { heading: heading || null });
                  }}
                  placeholder="Heading"
                  className="field-box !text-xs"
                />
                <input
                  defaultValue={e.href ?? ""}
                  onBlur={(ev) => {
                    const href = ev.target.value.trim();
                    if (href !== (e.href ?? "")) void patch(e.id, { href: href || null });
                  }}
                  placeholder="Links to (optional)"
                  className="field-box !text-xs"
                />

                <div className="flex items-center justify-end gap-3 border-t border-line pt-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => void patch(e.id, { isActive: !e.isActive })}
                      title={e.isActive ? "Hide" : "Show"}
                      className="p-1.5 text-ink-muted transition-colors hover:text-brass"
                    >
                      {e.isActive ? (
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => void remove(e.id)}
                      title="Delete"
                      className="p-1.5 text-ink-muted transition-colors hover:text-clay"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="label flex cursor-pointer items-center justify-center gap-2.5 border border-dashed border-line py-7 text-ink-muted transition-colors hover:border-brass hover:text-brass">
        <Upload className="h-4 w-4" strokeWidth={1.5} />
        {uploading ? "Uploading…" : "Upload Editorial Images"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(ev) => void upload(ev.target.files)}
          className="sr-only"
        />
      </label>
      <p className="-mt-3 text-xs text-ink-muted">
        Landscape images work best — each one fills the space of four product cards. They appear
        on the first page of the shop only.
      </p>
    </div>
  );
}
