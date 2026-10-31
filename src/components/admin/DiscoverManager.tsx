"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Trash2, Plus, Eye, EyeOff, Film } from "lucide-react";
import { NumberField } from "@/components/admin/NumberField";

type Panel = {
  id: string;
  eyebrow: string | null;
  heading: string;
  mediaUrl: string | null;
  posterUrl: string;
  href: string;
  overlay: number;
  sortOrder: number;
  isActive: boolean;
};

export function DiscoverManager({ initial }: { initial: Panel[] }) {
  const router = useRouter();
  const [panels, setPanels] = useState(initial);
  const [adding, setAdding] = useState(false);

  const patch = async (id: string, data: Partial<Panel>) => {
    setPanels((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    const res = await fetch(`/api/admin/discover/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  const remove = async (panel: Panel) => {
    if (!window.confirm(`Delete the “${panel.heading}” panel?`)) return;
    setPanels((prev) => prev.filter((p) => p.id !== panel.id));
    await fetch(`/api/admin/discover/${panel.id}`, { method: "DELETE" });
    toast.success("Panel deleted");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {panels.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2">
          {panels.map((panel) => (
            <li
              key={panel.id}
              className={`border bg-paper-raised ${
                panel.isActive ? "border-line" : "border-dashed border-line opacity-60"
              }`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-paper-sunk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={panel.posterUrl} alt="" className="h-full w-full object-cover" />
                {panel.mediaUrl && (
                  <span className="label absolute left-2 top-2 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[0.5rem] text-paper">
                    <Film className="h-2.5 w-2.5" strokeWidth={2} />
                    Video
                  </span>
                )}
              </div>

              <div className="p-5">
                {panel.eyebrow && <p className="label text-brass">{panel.eyebrow}</p>}
                <p className="mt-1.5 font-display text-xl">{panel.heading}</p>
                <p className="mt-1 truncate text-xs text-ink-muted">→ {panel.href}</p>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <label className="block">
                    <span className="label text-[0.55rem] text-ink-muted">Overlay %</span>
                    <NumberField
                      value={String(panel.overlay)}
                      decimals={false}
                      min={0}
                      max={80}
                      onCommit={(val) => {
                        const n = Number(val);
                        if (Number.isFinite(n) && n !== panel.overlay) void patch(panel.id, { overlay: n });
                      }}
                      className="field-box mt-1 w-20"
                    />
                  </label>

                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => void patch(panel.id, { isActive: !panel.isActive })}
                      title={panel.isActive ? "Hide" : "Show"}
                      className="p-2 text-ink-muted transition-colors hover:text-brass"
                    >
                      {panel.isActive ? (
                        <Eye className="h-4 w-4" strokeWidth={1.5} />
                      ) : (
                        <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(panel)}
                      title="Delete"
                      className="p-2 text-ink-muted transition-colors hover:text-clay"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Video can be added or swapped without rebuilding the panel. */}
                <PanelVideo panel={panel} onChange={(url) => void patch(panel.id, { mediaUrl: url })} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <NewPanel
          onCancel={() => setAdding(false)}
          onCreated={(panel) => {
            setPanels((prev) => [...prev, panel]);
            setAdding(false);
            router.refresh();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="label flex w-full items-center justify-center gap-2.5 border border-dashed border-line py-6 text-ink-muted transition-colors hover:border-brass hover:text-brass"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add a Panel
        </button>
      )}
    </div>
  );
}

function PanelVideo({ panel, onChange }: { panel: Panel; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false);

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      toast.error(data.error ?? "Upload failed.");
      return;
    }
    onChange(data.url);
    toast.success("Video set");
  };

  return (
    <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
      <label className="label flex flex-1 cursor-pointer items-center justify-center gap-2 border border-dashed border-line py-2.5 text-ink-muted transition-colors hover:border-brass hover:text-brass">
        <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
        {busy ? "Uploading…" : panel.mediaUrl ? "Replace video" : "Add video"}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => void upload(e.target.files)}
          className="sr-only"
        />
      </label>
      {panel.mediaUrl && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="label px-3 py-2.5 text-ink-muted hover:text-clay"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function NewPanel({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (panel: Panel) => void;
}) {
  const [v, setV] = useState({
    eyebrow: "",
    heading: "",
    href: "",
    posterUrl: "",
    mediaUrl: "",
    overlay: 30,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null, slot: "posterUrl" | "mediaUrl") => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }
    setV((prev) => ({ ...prev, [slot]: data.url }));
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...v,
        eyebrow: v.eyebrow || null,
        mediaUrl: v.mediaUrl || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save the panel.");
      return;
    }
    toast.success("Panel added");
    onCreated(data.panel);
  };

  return (
    <section className="border border-line bg-paper-raised p-6">
      <h3 className="label-lg">New Panel</h3>
      <hr className="rule-deco mt-4 mb-6" />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="label text-ink-muted">Eyebrow</span>
          <input
            value={v.eyebrow}
            onChange={(e) => setV({ ...v, eyebrow: e.target.value })}
            placeholder="For Him"
            className="field-box mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Heading</span>
          <input
            value={v.heading}
            onChange={(e) => setV({ ...v, heading: e.target.value })}
            placeholder="Built for the long look."
            className="field-box mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="label text-ink-muted">Links to</span>
          <input
            value={v.href}
            onChange={(e) => setV({ ...v, href: e.target.value })}
            placeholder="/shop?gender=Men"
            className="field-box mt-1.5"
          />
        </label>

        <label className="label flex cursor-pointer items-center justify-center gap-2 border border-dashed border-line py-4 text-ink-muted transition-colors hover:border-brass hover:text-brass">
          <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
          {v.posterUrl ? "Thumbnail set — replace" : "Thumbnail image *"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => void upload(e.target.files, "posterUrl")}
            className="sr-only"
          />
        </label>

        <label className="label flex cursor-pointer items-center justify-center gap-2 border border-dashed border-line py-4 text-ink-muted transition-colors hover:border-brass hover:text-brass">
          <Film className="h-3.5 w-3.5" strokeWidth={1.5} />
          {v.mediaUrl ? "Video set — replace" : "Video (optional)"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => void upload(e.target.files, "mediaUrl")}
            className="sr-only"
          />
        </label>
      </div>

      {error && <p className="mt-5 border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mt-6 flex gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => void save()}
          disabled={busy || !v.heading || !v.href || !v.posterUrl}
          className="btn-ink label px-9 py-3.5"
        >
          {busy ? "Working…" : "Add Panel"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline label px-9 py-3.5">
          Cancel
        </button>
      </div>
    </section>
  );
}
