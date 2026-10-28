"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";

type Post = {
  id: string;
  imageUrl: string;
  href: string | null;
  caption: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function InstagramManager({
  initial,
  settings,
  keys,
}: {
  initial: Post[];
  settings: Record<string, string | undefined>;
  keys: Record<string, string>;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    heading: settings[keys.instagramHeading] ?? "",
    handle: settings[keys.instagramHandle] ?? "",
    url: settings[keys.instagramUrl] ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [keys.instagramHeading]: profile.heading,
        [keys.instagramHandle]: profile.handle,
        [keys.instagramUrl]: profile.url,
      }),
    });
    setSavingProfile(false);
    if (!res.ok) {
      toast.error("Could not save.");
      return;
    }
    toast.success("Instagram details saved");
    router.refresh();
  };

  /** Several images at once — a grid is usually filled in one go. */
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

      const res = await fetch("/api/admin/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: data.url }),
      });
      const created = await res.json().catch(() => ({}));
      if (res.ok) setPosts((prev) => [...prev, created.post]);
    }

    setUploading(false);
    router.refresh();
  };

  const patch = async (id: string, data: Partial<Post>) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    const res = await fetch(`/api/admin/instagram/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Could not save that change.");
      router.refresh();
    }
  };

  const remove = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/admin/instagram/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 border border-line bg-paper-raised p-6 sm:grid-cols-3">
        <label className="block">
          <span className="label text-ink-muted">Heading</span>
          <input
            value={profile.heading}
            onChange={(e) => setProfile({ ...profile, heading: e.target.value })}
            placeholder="Follow Along"
            className="field-box mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Handle</span>
          <input
            value={profile.handle}
            onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
            placeholder="@broadwayopticals"
            className="field-box mt-1.5"
          />
        </label>
        <label className="block">
          <span className="label text-ink-muted">Profile URL</span>
          <input
            value={profile.url}
            onChange={(e) => setProfile({ ...profile, url: e.target.value })}
            placeholder="https://instagram.com/broadwayopticals"
            className="field-box mt-1.5"
          />
        </label>
        <div className="sm:col-span-3">
          <button
            onClick={() => void saveProfile()}
            disabled={savingProfile}
            className="btn-outline label px-8 py-3"
          >
            {savingProfile ? "Saving…" : "Save Details"}
          </button>
        </div>
      </div>

      {posts.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className={`border bg-paper-raised ${
                post.isActive ? "border-line" : "border-dashed border-line opacity-55"
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-paper-sunk">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>

              <div className="p-2.5">
                <input
                  defaultValue={post.href ?? ""}
                  onBlur={(e) => {
                    const href = e.target.value.trim();
                    if (href !== (post.href ?? "")) void patch(post.id, { href: href || null });
                  }}
                  placeholder="Post link"
                  className="field-box !px-2 !py-1.5 !text-[11px]"
                />

                <div className="mt-2 flex justify-between">
                  <button
                    onClick={() => void patch(post.id, { isActive: !post.isActive })}
                    title={post.isActive ? "Hide" : "Show"}
                    className="p-1 text-ink-muted transition-colors hover:text-brass"
                  >
                    {post.isActive ? (
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />
                    )}
                  </button>
                  <button
                    onClick={() => void remove(post.id)}
                    title="Delete"
                    className="p-1 text-ink-muted transition-colors hover:text-clay"
                  >
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="label flex cursor-pointer items-center justify-center gap-2.5 border border-dashed border-line py-7 text-ink-muted transition-colors hover:border-brass hover:text-brass">
        <Upload className="h-4 w-4" strokeWidth={1.5} />
        {uploading ? "Uploading…" : "Upload Posts"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(e) => void upload(e.target.files)}
          className="sr-only"
        />
      </label>
      <p className="-mt-3 text-xs text-ink-muted">
        Square images work best. Add the post link so a tile opens that post rather than the
        profile.
      </p>
    </div>
  );
}
