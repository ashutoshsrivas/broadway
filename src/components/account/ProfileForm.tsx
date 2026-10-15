"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function ProfileForm({
  user,
}: {
  user: { name: string; email: string; phone: string | null };
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        phone: String(form.get("phone") ?? ""),
      }),
    });

    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      toast.error(data.error ?? "Could not save your details.");
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-paper-raised p-7">
      <h2 className="label-lg">Your Details</h2>
      <hr className="rule-deco mt-4 mb-6" />

      <div className="space-y-6">
        <label className="block">
          <span className="label text-ink-muted">Full name</span>
          <input name="name" defaultValue={user.name} required className="field mt-1.5" />
        </label>

        <label className="block">
          <span className="label text-ink-muted">Email</span>
          <input value={user.email} disabled className="field mt-1.5" />
          {/* Email identifies the account, so it isn't editable here. */}
          <span className="mt-2 block text-xs text-ink-muted">
            Contact us if you need to change your email.
          </span>
        </label>

        <label className="block">
          <span className="label text-ink-muted">Phone</span>
          <input name="phone" type="tel" defaultValue={user.phone ?? ""} className="field mt-1.5" />
        </label>
      </div>

      <button type="submit" disabled={submitting} className="btn-ink label mt-7 px-9 py-3.5">
        {submitting ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
