"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? "").trim(),
        email,
        phone: String(form.get("phone") ?? "").trim(),
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not create your account.");
      setSubmitting(false);
      return;
    }

    // Sign the new account straight in — asking someone to type the password
    // they just chose is friction with no security benefit.
    await signIn("credentials", { email, password, redirect: false });
    router.push("/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block">
        <span className="label text-ink-muted">Full name</span>
        <input name="name" required autoComplete="name" className="field mt-1.5" />
      </label>

      <label className="block">
        <span className="label text-ink-muted">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field mt-1.5" />
      </label>

      <label className="block">
        <span className="label text-ink-muted">Phone (optional)</span>
        <input name="phone" type="tel" autoComplete="tel" className="field mt-1.5" />
      </label>

      <label className="block">
        <span className="label text-ink-muted">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field mt-1.5"
        />
        <span className="mt-2 block text-xs text-ink-muted">At least 8 characters.</span>
      </label>

      {error && (
        <p className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-ink label w-full py-4">
        {submitting ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}
