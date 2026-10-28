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
  afterProducts: number;
  sortOrder: number;
  isActive: boolean;
};

export function ShopEditorialManager({ initial }: { initial: Editorial[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [uploading, setUploading] = useState(false);

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
        body: JSON.stringify({ imageUrl: data.url, afterProducts: (items.length + 1) * 6 }),
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

                <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
                  <label className="block">
                    <span className="label text-[0.55rem] text-ink-muted">After N products</span>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      defaultValue={e.afterProducts}
                      onBlur={(ev) => {
                        const n = Number(ev.target.value);
                        if (n >= 1 && n <= 60 && n !== e.afterProducts) {
                          void patch(e.id, { afterProducts: n });
                        }
                      }}
                      className="field-box mt-1 w-20 !text-xs"
                    />
                  </label>

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
