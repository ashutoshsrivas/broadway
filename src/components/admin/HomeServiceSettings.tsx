"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, X } from "lucide-react";
import { SETTING_KEYS } from "@/lib/settings";

type Settings = Partial<Record<string, string>>;

/**
 * The home-service band and its inner page, in the shop's own words.
 *
 * Shipped with stand-in copy that the storefront labels as a placeholder, so
 * nobody mistakes our guess for the shop's offer. The moment a heading, blurb
 * or body is typed here, the label goes away.
 */
/** One uploadable image bound to a setting key. */
function ImageField({
  label,
  hint,
  settingKey,
  initial,
  save,
}: {
  label: string;
  hint: string;
  settingKey: string;
  initial: string;
  save: (key: string, value: string) => Promise<void>;
}) {
  const [url, setUrl] = useState(initial);
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
      toast.error(data.error ?? "Could not upload that image.");
      return;
    }
    setUrl(data.url);
    void save(settingKey, data.url);
  };

  return (
    <div>
      <span className="label text-ink-muted">{label}</span>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">{hint}</p>
      <div className="mt-2.5 flex items-center gap-4">
        <div className="relative h-20 w-32 shrink-0 overflow-hidden border border-line bg-paper">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="label absolute inset-0 flex items-center justify-center px-2 text-center text-[0.45rem] leading-tight text-ink-muted">
              Placeholder
            </span>
          )}
        </div>

        <label className="label flex cursor-pointer items-center gap-2 border border-dashed border-line px-5 py-3 text-ink-muted transition-colors hover:border-brass hover:text-brass">
          <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => void upload(e.target.files)}
            className="sr-only"
          />
        </label>

        {url && (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              void save(settingKey, "");
            }}
            title="Remove"
            className="p-1.5 text-ink-muted transition-colors hover:text-clay"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

export function HomeServiceSettings({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [on, setOn] = useState((settings[SETTING_KEYS.homeServiceEnabled] ?? "") === "1");
  const [image, setImage] = useState(settings[SETTING_KEYS.homeServiceImage] ?? "");
  const [uploading, setUploading] = useState(false);

  const save = async (key: string, value: string) => {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    if (!res.ok) {
      toast.error("Could not save.");
      router.refresh();
      return;
    }
    toast.success("Saved");
    router.refresh();
  };

  const field = (key: string, label: string, hint: string, rows = 0) => {
    const current = settings[key] ?? "";
    const common = {
      defaultValue: current,
      placeholder: hint,
      className: `field-box mt-1.5 !text-xs${rows ? " resize-y" : ""}`,
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value.trim();
        if (value !== current) void save(key, value);
      },
    };
    return (
      <label className="block">
        <span className="label text-ink-muted">{label}</span>
        {rows ? <textarea {...common} rows={rows} /> : <input {...common} />}
      </label>
    );
  };

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Could not upload that image.");
      return;
    }
    setImage(data.url);
    void save(SETTING_KEYS.homeServiceImage, data.url);
  };

  return (
    <div className="space-y-5 border border-line bg-paper-raised p-5">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => {
            setOn(e.target.checked);
            void save(SETTING_KEYS.homeServiceEnabled, e.target.checked ? "1" : "");
          }}
          className="mt-0.5 h-4 w-4 accent-[#B08D4F]"
        />
        <span>
          <span className="label">Show the home-service band</span>
          <span className="mt-1.5 block max-w-xl text-xs leading-relaxed text-ink-muted">
            A band on the homepage and its own page at{" "}
            <code className="text-brass">/broadway-at-home</code>. Leave it off until the wording
            is yours — the page shows a placeholder notice until then.
          </span>
        </span>
      </label>

      <div className="grid gap-4 border-t border-line pt-5 lg:grid-cols-2">
        {field(SETTING_KEYS.homeServiceEyebrow, "Eyebrow", "Home Service")}
        {field(SETTING_KEYS.homeServicePhone, "Phone shown on the buttons", "+91 135 2632280")}
        {field(SETTING_KEYS.homeServiceWhatsapp, "WhatsApp number", "+91 75977 72222")}
        <div className="lg:col-span-2">
          {field(
            SETTING_KEYS.homeServiceHeading,
            "Heading",
            "An eye test at your dining table."
          )}
        </div>
        <div className="lg:col-span-2">
          {field(
            SETTING_KEYS.homeServiceBlurb,
            "Short intro",
            "One or two sentences, shown on the homepage band.",
            2
          )}
        </div>
        <div className="lg:col-span-2">
          {field(
            SETTING_KEYS.homeServiceCities,
            "Towns — comma separated",
            "Dehradun, Rishikesh, Haridwar"
          )}
        </div>
        <div className="lg:col-span-2">
          {field(
            SETTING_KEYS.homeServiceBody,
            "Full wording for the inner page",
            "Paste the home-service text from the current website. Blank lines start a new paragraph.",
            6
          )}
        </div>
      </div>

      <div className="grid gap-6 border-t border-line pt-5 lg:grid-cols-2">
        <ImageField
          label="Hero photograph"
          hint="Top of the Broadway at Home page — landscape, it drifts as you scroll"
          settingKey={SETTING_KEYS.homeServiceHeroImage}
          initial={settings[SETTING_KEYS.homeServiceHeroImage] ?? ""}
          save={save}
        />
      </div>

      <div className="border-t border-line pt-5">
        <span className="label text-ink-muted">Photograph</span>
        <div className="mt-2 flex items-center gap-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden border border-line bg-paper">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="label absolute inset-0 flex items-center justify-center px-2 text-center text-[0.45rem] leading-tight text-ink-muted">
                Placeholder
              </span>
            )}
          </div>

          <label className="label flex cursor-pointer items-center gap-2 border border-dashed border-line px-5 py-3 text-ink-muted transition-colors hover:border-brass hover:text-brass">
            <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => void upload(e.target.files)}
              className="sr-only"
            />
          </label>

          {image && (
            <button
              type="button"
              onClick={() => {
                setImage("");
                void save(SETTING_KEYS.homeServiceImage, "");
              }}
              title="Remove the photograph"
              className="p-1.5 text-ink-muted transition-colors hover:text-clay"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
