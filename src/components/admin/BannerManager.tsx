"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Trash2, Plus, ChevronUp, ChevronDown, Eye, EyeOff, Film, Image as ImageIcon } from "lucide-react";

type Banner = {
  id: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  posterUrl: string | null;
  eyebrow: string | null;
  heading: string | null;
  subheading: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  align: "LEFT" | "CENTRE" | "RIGHT";
  overlay: number;
  durationMs: number;
  sortOrder: number;
  isActive: boolean;
};

/** The new-slide draft. Typed rather than inferred so `mediaType` and `align`
 *  stay the full unions — `as const` would pin them to their initial value. */
type Draft = {
  mediaUrl: string;
  mediaType: Banner["mediaType"];
  posterUrl: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  align: Banner["align"];
  overlay: number;
  durationMs: number;
};

const BLANK: Draft = {
  mediaUrl: "",
  mediaType: "IMAGE",
  posterUrl: "",
  eyebrow: "",
  heading: "",
  subheading: "",
  ctaLabel: "",
  ctaHref: "",
  align: "LEFT",
  overlay: 35,
  durationMs: 5000,
};

export function BannerManager({ initial }: { initial: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initial);
  const [adding, setAdding] = useState(initial.length === 0);

  const patch = async (id: string, data: Partial<Banner>) => {
    // Applied locally first so toggles and reordering feel instant; the server
    // is the authority and a failure re-reads from it.
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));

    const res = await fetch(`/api/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  /** Swap a slide with its neighbour, persisting both new positions. */
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= banners.length) return;

    const reordered = [...banners];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const renumbered = reordered.map((b, i) => ({ ...b, sortOrder: i + 1 }));
    setBanners(renumbered);

    await Promise.all(
      [renumbered[index], renumbered[target]].map((b) =>
        fetch(`/api/admin/banners/${b.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: b.sortOrder }),
        })
      )
    );
    router.refresh();
  };

  const remove = async (banner: Banner) => {
    if (!window.confirm(`Delete this slide${banner.heading ? ` (“${banner.heading}”)` : ""}?`)) return;

    setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    await fetch(`/api/admin/banners/${banner.id}`, { method: "DELETE" });
    toast.success("Slide deleted");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {banners.length > 0 && (
        <ul className="space-y-4">
          {banners.map((banner, i) => (
            <li
              key={banner.id}
              className={`border bg-paper-raised ${
                banner.isActive ? "border-line" : "border-dashed border-line opacity-60"
              }`}
            >
              <div className="flex flex-col gap-5 p-5 sm:flex-row">
                {/* Preview */}
                <div className="relative h-28 w-full shrink-0 overflow-hidden bg-paper-sunk sm:w-48">
                  {banner.mediaType === "VIDEO" ? (
                    <video
                      src={banner.mediaUrl}
                      poster={banner.posterUrl ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={banner.mediaUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  <span className="label absolute left-2 top-2 flex items-center gap-1.5 bg-ink/80 px-2 py-1 text-[0.5rem] text-paper">
                    {banner.mediaType === "VIDEO" ? (
                      <Film className="h-2.5 w-2.5" strokeWidth={2} />
                    ) : (
                      <ImageIcon className="h-2.5 w-2.5" strokeWidth={2} />
                    )}
                    {i + 1}
                  </span>
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg leading-snug">
                    {banner.heading || <span className="text-ink-muted">Untitled slide</span>}
                  </p>
                  {banner.eyebrow && <p className="label mt-1 text-brass">{banner.eyebrow}</p>}
                  {banner.subheading && (
                    <p className="mt-2 line-clamp-2 text-xs text-ink-muted">{banner.subheading}</p>
                  )}

                  <div className="mt-4 flex flex-wrap items-end gap-5">
                    <label className="block">
                      <span className="label text-[0.55rem] text-ink-muted">Seconds</span>
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="30"
                        defaultValue={banner.durationMs / 1000}
                        onBlur={(e) => {
                          const ms = Math.round(Number(e.target.value) * 1000);
                          if (ms >= 1000 && ms <= 30000 && ms !== banner.durationMs) {
                            void patch(banner.id, { durationMs: ms });
                          }
                        }}
                        className="field-box mt-1 w-20"
                      />
                    </label>

                    <label className="block">
                      <span className="label text-[0.55rem] text-ink-muted">Overlay %</span>
                      <input
                        type="number"
                        min="0"
                        max="80"
                        step="5"
                        defaultValue={banner.overlay}
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v >= 0 && v <= 80 && v !== banner.overlay) {
                            void patch(banner.id, { overlay: v });
                          }
                        }}
                        className="field-box mt-1 w-20"
                      />
                    </label>

                    <label className="block">
                      <span className="label text-[0.55rem] text-ink-muted">Align</span>
                      <select
                        value={banner.align}
                        onChange={(e) =>
                          void patch(banner.id, { align: e.target.value as Banner["align"] })
                        }
                        className="field-box mt-1 w-28"
                      >
                        <option value="LEFT">Left</option>
                        <option value="CENTRE">Centre</option>
                        <option value="RIGHT">Right</option>
                      </select>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-start gap-1 sm:flex-col">
                  <button
                    type="button"
                    onClick={() => void patch(banner.id, { isActive: !banner.isActive })}
                    title={banner.isActive ? "Hide from the homepage" : "Show on the homepage"}
                    className="p-2 text-ink-muted transition-colors hover:text-brass"
                  >
                    {banner.isActive ? (
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(i, -1)}
                    disabled={i === 0}
                    title="Move earlier"
                    className="p-2 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ChevronUp className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void move(i, 1)}
                    disabled={i === banners.length - 1}
                    title="Move later"
                    className="p-2 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(banner)}
                    title="Delete slide"
                    className="p-2 text-ink-muted transition-colors hover:text-clay"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <NewBanner
          onCancel={() => setAdding(false)}
          onCreated={(banner) => {
            setBanners((prev) => [...prev, banner]);
            setAdding(false);
            router.refresh();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="label flex w-full items-center justify-center gap-2.5 border border-dashed border-line py-8 text-ink-muted transition-colors hover:border-brass hover:text-brass"
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add a Slide
        </button>
      )}
    </div>
  );
}

function NewBanner({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (banner: Banner) => void;
}) {
  const [v, setV] = useState(BLANK);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setV((prev) => ({ ...prev, [key]: value }));

  const upload = async (files: FileList | null, slot: "mediaUrl" | "posterUrl") => {
    const file = files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      return;
    }

    if (slot === "mediaUrl") {
      // The media type follows what was actually uploaded, so a video can
      // never be left mislabelled as an image and rendered in an <img>.
      setV((prev) => ({
        ...prev,
        mediaUrl: data.url,
        mediaType: file.type.startsWith("video/") ? "VIDEO" : "IMAGE",
      }));
    } else {
      set("posterUrl", data.url);
    }
  };

  const save = async () => {
    if (!v.mediaUrl) {
      setError("Upload an image or video first.");
      return;
    }
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...v,
        posterUrl: v.posterUrl || null,
        eyebrow: v.eyebrow || null,
        heading: v.heading || null,
        subheading: v.subheading || null,
        ctaLabel: v.ctaLabel || null,
        ctaHref: v.ctaHref || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Could not save the slide.");
      return;
    }
    toast.success("Slide added");
    onCreated(data.banner);
  };

  return (
    <section className="border border-line bg-paper-raised p-6 lg:p-7">
      <h2 className="label-lg">New Slide</h2>
      <hr className="rule-deco mt-4 mb-6" />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Media */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden border border-line bg-paper-sunk">
            {v.mediaUrl ? (
              v.mediaType === "VIDEO" ? (
                <video src={v.mediaUrl} muted loop autoPlay playsInline className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.mediaUrl} alt="" className="h-full w-full object-cover" />
              )
            ) : (
              <span className="label absolute inset-0 flex items-center justify-center text-ink-muted">
                No media
              </span>
            )}
          </div>

          <label className="label mt-3 flex cursor-pointer items-center justify-center gap-2.5 border border-dashed border-line py-4 text-ink-muted transition-colors hover:border-brass hover:text-brass">
            <Upload className="h-4 w-4" strokeWidth={1.5} />
            {uploading ? "Uploading…" : v.mediaUrl ? "Replace" : "Upload image or video"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
              onChange={(e) => void upload(e.target.files, "mediaUrl")}
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-[11px] leading-tight text-ink-muted">
            Images up to 5 MB, video up to 64 MB. Landscape, at least 1920px wide.
          </p>

          {v.mediaType === "VIDEO" && (
            <label className="label mt-3 flex cursor-pointer items-center justify-center gap-2.5 border border-dashed border-line py-3 text-ink-muted transition-colors hover:border-brass hover:text-brass">
              <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
              {v.posterUrl ? "Poster set — replace" : "Poster image (recommended)"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={(e) => void upload(e.target.files, "posterUrl")}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {/* Caption */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Eyebrow" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} placeholder="Est. 1974 · New Delhi" />
          <Field label="Heading" value={v.heading} onChange={(x) => set("heading", x)} placeholder="See, and be seen." />
          <div className="sm:col-span-2">
            <label className="label block text-ink-muted">Subheading</label>
            <textarea
              value={v.subheading}
              onChange={(e) => set("subheading", e.target.value)}
              rows={2}
              className="field-box mt-1.5 resize-none"
            />
          </div>
          <Field label="Button label" value={v.ctaLabel} onChange={(x) => set("ctaLabel", x)} placeholder="Shop All Frames" />
          <Field label="Button link" value={v.ctaHref} onChange={(x) => set("ctaHref", x)} placeholder="/shop" />

          <label className="block">
            <span className="label text-ink-muted">Seconds on screen</span>
            <input
              type="number"
              step="0.5"
              min="1"
              max="30"
              value={v.durationMs / 1000}
              onChange={(e) => set("durationMs", Math.round(Number(e.target.value) * 1000))}
              className="field-box mt-1.5"
            />
          </label>

          <label className="block">
            <span className="label text-ink-muted">Text alignment</span>
            <select
              value={v.align}
              onChange={(e) => set("align", e.target.value as Draft["align"])}
              className="field-box mt-1.5"
            >
              <option value="LEFT">Left</option>
              <option value="CENTRE">Centre</option>
              <option value="RIGHT">Right</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="label text-ink-muted">Darken media — {v.overlay}%</span>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={v.overlay}
              onChange={(e) => set("overlay", Number(e.target.value))}
              className="mt-2.5 w-full accent-[#B08D4F]"
            />
            <span className="mt-1.5 block text-[11px] text-ink-muted">
              Raise it until the caption reads clearly against the photo.
            </span>
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-5 border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || uploading}
          className="btn-ink label px-9 py-3.5"
        >
          {saving ? "Saving…" : "Add Slide"}
        </button>
        <button type="button" onClick={onCancel} className="btn-outline label px-9 py-3.5">
          Cancel
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label text-ink-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-box mt-1.5"
      />
    </label>
  );
}
