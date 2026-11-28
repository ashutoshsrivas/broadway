"use client";

import { useState } from "react";
import toast from "react-hot-toast";

/**
 * The newsletter signup.
 *
 * There is no mailing-list integration yet, so rather than pretend to
 * subscribe someone and quietly drop their address, this says plainly that
 * it is not connected and hands them the shop's email instead. A form that
 * silently does nothing is worse than no form.
 */
export function NewsletterForm({ email }: { email?: string }) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return;
        toast(
          "Our mailing list isn't connected yet — email us and we'll add you by hand.",
          { icon: "✉️" }
        );
        setValue("");
      }}
      className="mt-6"
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Your email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter your email address"
        className="w-full border border-paper/25 bg-transparent px-4 py-3.5 text-sm text-paper placeholder:text-paper/35 focus:border-brass focus:outline-none"
      />
      <button
        type="submit"
        className="label mt-3 w-full border border-paper/25 px-6 py-3.5 text-paper transition-colors hover:border-brass hover:bg-brass hover:text-ink"
      >
        Subscribe
      </button>
      {email && (
        <p className="mt-3 text-xs text-paper/40">
          Or write to{" "}
          <a href={`mailto:${email}`} className="hover:text-paper">
            {email}
          </a>
        </p>
      )}
    </form>
  );
}
