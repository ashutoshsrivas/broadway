"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { NumberField } from "@/components/admin/NumberField";
import { SETTING_KEYS } from "@/lib/settings";

type Settings = Partial<Record<string, string>>;

/**
 * The homepage switches: the notice strip, how long a frame counts as new,
 * which form the category boxes take and how many cards a phone shows.
 *
 * Everything here saves immediately. The shop is meant to be able to change
 * any of it between two customers walking in.
 */
export function HomepageControls({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  const [stripOn, setStripOn] = useState(
    (settings[SETTING_KEYS.announcementEnabled] ?? "1") === "1"
  );
  const [notices, setNotices] = useState(settings[SETTING_KEYS.announcementNotices] ?? "");
  const [mode, setMode] = useState(settings[SETTING_KEYS.categoryBoxesMode] ?? "hidden");

  const save = async (key: string, value: string) => {
    setSaving(key);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    setSaving(null);
    if (!res.ok) {
      toast.error("Could not save.");
      router.refresh();
      return;
    }
    toast.success("Saved");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* ── Notice strip ────────────────────────────────────────────────── */}
      <div className="border border-line bg-paper-raised p-5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={stripOn}
            onChange={(e) => {
              setStripOn(e.target.checked);
              void save(SETTING_KEYS.announcementEnabled, e.target.checked ? "1" : "");
            }}
            className="mt-0.5 h-4 w-4 accent-[#B08D4F]"
          />
          <span>
            <span className="label">Show the notice strip</span>
            <span className="mt-1.5 block max-w-xl text-xs leading-relaxed text-ink-muted">
              The scrolling band above the header. Switch it off and it disappears from every
              page — use it for a sale and turn it off when the sale ends.
            </span>
          </span>
        </label>

        <label className="mt-5 block">
          <span className="label text-ink-muted">Notices — one per line</span>
          <textarea
            value={notices}
            onChange={(e) => setNotices(e.target.value)}
            onBlur={() => {
              if (notices !== (settings[SETTING_KEYS.announcementNotices] ?? "")) {
                void save(SETTING_KEYS.announcementNotices, notices);
              }
            }}
            rows={4}
            disabled={!stripOn}
            placeholder={"FLAT 20% OFF ALL SUNGLASSES\nFree lens fitting at every store"}
            className="field-box mt-1.5 resize-y !text-xs disabled:opacity-50"
          />
          <span className="mt-1.5 block text-xs text-ink-muted">
            Leave this empty to keep the four notices the site ships with.
          </span>
        </label>
      </div>

      {/* ── New on the rack ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 border border-line bg-paper-raised p-5">
        <label className="block">
          <span className="label text-ink-muted">New on the rack — days</span>
          <NumberField
            value={settings[SETTING_KEYS.newArrivalsDays] ?? "15"}
            decimals={false}
            min={1}
            max={120}
            onCommit={(value) => void save(SETTING_KEYS.newArrivalsDays, value)}
            className="field-box mt-1.5 w-24"
            aria-label="Days a frame stays new"
          />
        </label>
        <p className="flex-1 text-xs leading-relaxed text-ink-muted">
          How long a frame shows on the New on the Rack deck and wears the New badge. At 15, a
          frame added today drops off on day 16. Nothing to clear by hand.
        </p>
      </div>

      {/* ── Category boxes ──────────────────────────────────────────────── */}
      <div className="border border-line bg-paper-raised p-5">
        <span className="label text-ink-muted">Category boxes</span>
        <div className="mt-3 space-y-3">
          {[
            {
              value: "hidden",
              title: "No boxes (a)",
              note: "The homepage goes straight from the arrivals deck to Discover. Your preference, and the default.",
            },
            {
              value: "hover",
              title: "Invisible until hover (b)",
              note: "The photograph is bare until pointed at, then the frame and the name fade in. A phone has no hover, so there they stay visible — otherwise the labels would never show on the screens most people use.",
            },
          ].map((option) => (
            <label key={option.value} className="flex cursor-pointer items-start gap-3">
              <input
                type="radio"
                name="categoryBoxes"
                checked={mode === option.value}
                onChange={() => {
                  setMode(option.value);
                  void save(SETTING_KEYS.categoryBoxesMode, option.value);
                }}
                className="mt-0.5 h-4 w-4 accent-[#B08D4F]"
              />
              <span>
                <span className="label">{option.title}</span>
                <span className="mt-1.5 block max-w-xl text-xs leading-relaxed text-ink-muted">
                  {option.note}
                </span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-muted">
          Which departments appear is set per category under Categories &amp; Brands — tick
          &ldquo;Homepage box&rdquo; on the ones you want.
        </p>
      </div>

      {/* ── Phone grid ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4 border border-line bg-paper-raised p-5">
        <label className="block">
          <span className="label text-ink-muted">Products shown on a phone</span>
          <NumberField
            value={settings[SETTING_KEYS.mobileGridCount] ?? "6"}
            decimals={false}
            min={2}
            max={24}
            onCommit={(value) => void save(SETTING_KEYS.mobileGridCount, value)}
            className="field-box mt-1.5 w-24"
            aria-label="Products shown on a phone"
          />
        </label>
        <p className="flex-1 text-xs leading-relaxed text-ink-muted">
          Homepage product sections show this many cards on a phone, with a &ldquo;See
          more&rdquo; button for the rest. Desktop always shows the whole row.
        </p>
      </div>

      {saving && <p className="label text-ink-muted">Saving…</p>}
    </div>
  );
}
