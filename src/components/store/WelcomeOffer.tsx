"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Check, Copy } from "lucide-react";
import { PROMO_COOKIE, type Promo } from "@/lib/promo";

/** A year — long enough that the offer reads as once-per-visitor. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function hasSeen(): boolean {
  try {
    return document.cookie.split("; ").some((c) => c.startsWith(`${PROMO_COOKIE}=`));
  } catch {
    // Cookies blocked entirely. Treating that as "already seen" is the quiet
    // failure: better to skip the offer than to show it on every page load to
    // someone who can never dismiss it permanently.
    return true;
  }
}

function markSeen() {
  try {
    document.cookie = `${PROMO_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    /* nothing more to do — the dialog still closes for this session */
  }
}

/**
 * First-visit welcome offer.
 *
 * Held back for a few seconds rather than thrown up on load: a modal that
 * covers the hero before it has even painted is the thing people close
 * without reading. The cookie is set when the dialog is dismissed — or when
 * the code is copied — so a visitor sees it once, not once per page.
 */
export function WelcomeOffer({ promo }: { promo: Promo }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!promo.enabled || hasSeen()) return;
    const timer = setTimeout(() => setOpen(true), promo.delayMs);
    return () => clearTimeout(timer);
  }, [promo.enabled, promo.delayMs]);

  const close = useCallback(() => {
    markSeen();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      markSeen();
    } catch {
      // Clipboard refused (insecure origin, or permission). The code is on
      // screen to be typed, so this is not worth an error message.
      setCopied(false);
    }
  };

  if (!open) return null;

  const message = promo.message.replace(/\{percent\}/g, String(promo.percent));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-offer-heading"
      className="fixed inset-0 z-[90] flex items-center justify-center p-5"
    >
      <div className="absolute inset-0 bg-ink/55 animate-fade" onClick={close} />

      <div className="deco-frame relative w-full max-w-md border border-line bg-paper-raised p-8 text-center animate-rise lg:p-10">
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-4 top-4 p-1.5 text-ink-muted transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>

        <p className="label text-brass">Welcome</p>

        <h2 id="welcome-offer-heading" className="display mt-4 text-[clamp(2rem,5vw,2.75rem)]">
          {promo.heading}
        </h2>

        <p className="display mt-5 text-5xl text-brass lg:text-6xl">{promo.percent}% off</p>

        <p className="mx-auto mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
          {message}
        </p>

        <button
          onClick={() => void copy()}
          className="group mt-7 flex w-full items-center justify-between gap-4 border border-dashed border-brass bg-brass/8 px-5 py-4 transition-colors hover:bg-brass/15"
        >
          <span className="label-lg text-ink">{promo.code}</span>
          <span className="label flex items-center gap-2 text-brass">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                Copy
              </>
            )}
          </span>
        </button>

        <button onClick={close} className="btn-ink label mt-4 w-full py-4">
          Start Shopping
        </button>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-muted">
          Valid on your first order only.
        </p>
      </div>
    </div>
  );
}
