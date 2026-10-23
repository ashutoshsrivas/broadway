"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, ChevronDown, CornerDownLeft } from "lucide-react";
import { matchVocabulary, normalise, tidyLabel, type Candidate, type Kind } from "@/lib/attributes";

/**
 * Pick from the list, or type a new word and press Enter.
 *
 * Matching runs in the browser against the vocabulary loaded once on mount, so
 * every keystroke is instant and the server is only involved when a genuinely
 * new word is committed. Typos fold into the existing word rather than
 * splitting the list — "catt eye" resolves to "Cat Eye".
 */
export function AttributeCombobox({
  kind,
  label,
  value,
  onChange,
  options,
  onCreated,
  placeholder,
  required = false,
  hint,
}: {
  kind: Kind;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Candidate[];
  onCreated: (kind: Kind, value: Candidate) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [highlightFor, setHighlightFor] = useState(value);
  const [saving, setSaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const { exact, suggestions } = useMemo(() => {
    if (!value.trim()) {
      return { exact: null, suggestions: options.slice(0, 8) };
    }
    return matchVocabulary(value, options);
  }, [value, options]);

  // Is the typed text a word the list does not have yet?
  const typedSlug = normalise(value);
  const isNew =
    typedSlug.length > 0 &&
    !exact &&
    !options.some((o) => o.slug === typedSlug);

  // Typing moves the list, so the highlight goes back to the top. Adjusted
  // during render rather than in an effect: React re-runs this component
  // immediately and never commits the stale-highlight frame.
  if (highlightFor !== value) {
    setHighlightFor(value);
    setHighlight(0);
  }

  // Clicking away commits whatever is in the box — see commit() for why that
  // settles on the matched word rather than the raw text.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (candidate: Candidate) => {
    onChange(candidate.label);
    setOpen(false);
  };

  /** Persist a newly coined word, then select it. */
  const create = async () => {
    const clean = tidyLabel(value);
    if (!clean || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, label: clean }),
      });
      const data = await res.json();
      if (res.ok && data.value) {
        onCreated(kind, data.value);
        onChange(data.value.label);
      } else {
        // Saving the word failed, but the product form should not lose what
        // was typed — keep it and let the submit resolve it server-side.
        onChange(clean);
      }
    } catch {
      onChange(clean);
    } finally {
      setSaving(false);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key !== "Enter") return;

    // Enter inside the combobox never submits the form — it commits the word.
    e.preventDefault();

    const highlighted = suggestions[highlight];
    if (open && highlighted && !isNew) {
      pick(highlighted);
      return;
    }
    if (exact) {
      pick(exact);
      return;
    }
    if (isNew) {
      void create();
      return;
    }
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="label block text-ink-muted">
        {label}
        {required && <span className="ml-1 text-clay">*</span>}
      </label>

      <div className="relative mt-1.5">
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="field-box pr-9"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-ink-muted"
          aria-label={`Show ${label} options`}
        >
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {/* Status line: tells the person what Enter will do before they press it. */}
      {value.trim() && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-tight">
          {exact && normalise(value) !== exact.slug ? (
            <span className="text-brass">
              ↳ matches <strong>{exact.label}</strong> — Enter to use it
            </span>
          ) : isNew ? (
            <span className="flex items-center gap-1 text-clay">
              <CornerDownLeft className="h-3 w-3" strokeWidth={2} />
              New word — Enter adds <strong>{tidyLabel(value)}</strong> to the list
            </span>
          ) : (
            <span className="text-ink-muted">In the list</span>
          )}
        </p>
      )}
      {hint && !value.trim() && (
        <p className="mt-1.5 text-[11px] leading-tight text-ink-muted">{hint}</p>
      )}

      {open && (suggestions.length > 0 || isNew) && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-60 w-full overflow-y-auto border border-line bg-paper-raised shadow-lg"
        >
          {suggestions.map((option, i) => (
            <li key={option.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(option)}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm transition-colors ${
                  i === highlight ? "bg-paper-sunk text-ink" : "text-ink-soft"
                }`}
              >
                <span className="flex items-center gap-2">
                  {normalise(value) === option.slug && (
                    <Check className="h-3.5 w-3.5 text-brass" strokeWidth={2.5} />
                  )}
                  {option.label}
                </span>
                {option.usageCount > 0 && (
                  <span className="text-[10px] text-ink-muted">{option.usageCount}</span>
                )}
              </button>
            </li>
          ))}

          {isNew && (
            <li className="border-t border-line">
              <button
                type="button"
                onClick={create}
                disabled={saving}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-clay transition-colors hover:bg-paper-sunk"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                {saving ? "Adding…" : `Add “${tidyLabel(value)}” to the list`}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
