"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      redirect: false,
    });

    if (result?.error) {
      // Deliberately vague: saying which half was wrong tells an attacker
      // whether an email is registered.
      setError("That email and password don't match an account.");
      setSubmitting(false);
      return;
    }

    // `callbackUrl` is only honoured when it's a path on this site — an
    // absolute URL here would turn the login into an open redirect.
    const target = params.get("callbackUrl");
    router.push(target?.startsWith("/") ? target : "/account");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <label className="block">
        <span className="label text-ink-muted">Email</span>
        <input name="email" type="email" required autoComplete="email" className="field mt-1.5" />
      </label>

      <label className="block">
        <span className="label text-ink-muted">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="field mt-1.5"
        />
      </label>

      {error && (
        <p className="border border-clay/40 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-ink label w-full py-4">
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
