"use client";

import { useState } from "react";

/**
 * A numeric input that is a text input underneath.
 *
 * `<input type="number">` steps its value on the mouse wheel whenever it has
 * focus. On a price field with step="0.01" that silently turns 20000 into
 * 19999.98 from two stray scroll ticks while reading down the form — money
 * changed by a gesture nobody aimed at the field. There is no way to keep the
 * native control and switch that off reliably, so this does not use it.
 *
 * Typing is kept as a string so partial input ("1", "20.", "") stays on
 * screen as typed. Only digits, one decimal point and a leading minus are
 * accepted, so the text can always be parsed.
 */
export function NumberField({
  value,
  onChange,
  onCommit,
  decimals = true,
  allowNegative = false,
  min,
  max,
  placeholder,
  className = "field-box",
  disabled,
  "aria-label": ariaLabel,
}: {
  value?: string | number;
  onChange?: (value: string) => void;
  /** Fired on blur with the cleaned value — for save-on-blur fields. */
  onCommit?: (value: string) => void;
  decimals?: boolean;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const controlled = onChange !== undefined;
  const [draft, setDraft] = useState(String(value ?? ""));
  const shown = controlled ? String(value ?? "") : draft;

  const clean = (raw: string): string => {
    let out = raw.replace(decimals ? /[^0-9.-]/g : /[^0-9-]/g, "");

    // A minus is only meaningful at the front, and only when allowed.
    const negative = allowNegative && out.startsWith("-");
    out = out.replace(/-/g, "");

    if (decimals) {
      // Keep the first decimal point, drop any others.
      const [head, ...rest] = out.split(".");
      out = rest.length ? `${head}.${rest.join("")}` : head;
    }

    return negative ? `-${out}` : out;
  };

  const handle = (raw: string) => {
    const next = clean(raw);
    if (controlled) onChange!(next);
    else setDraft(next);
  };

  const commit = () => {
    // Range is applied on the way out, not while typing — clamping mid-keystroke
    // makes "5" impossible to type in a field with a minimum of 10.
    let out = shown.trim();
    if (out === "" || out === "-" || out === ".") {
      if (controlled) onChange!("");
      else setDraft("");
      onCommit?.("");
      return;
    }

    const n = Number(out);
    if (Number.isFinite(n)) {
      const clamped = Math.min(Math.max(n, min ?? -Infinity), max ?? Infinity);
      out = String(clamped);
      if (controlled) onChange!(out);
      else setDraft(out);
    }
    onCommit?.(out);
  };

  return (
    <input
      type="text"
      inputMode={decimals ? "decimal" : "numeric"}
      autoComplete="off"
      value={shown}
      onChange={(e) => handle(e.target.value)}
      onBlur={commit}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
    />
  );
}
