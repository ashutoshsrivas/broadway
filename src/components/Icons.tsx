/**
 * Brand glyphs lucide no longer ships. Two paths each — not worth a dependency.
 */
export function Instagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Facebook({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden="true"
    >
      <path d="M14.5 8.5h2.5V5.2h-2.6c-2.3 0-3.7 1.5-3.7 3.9v2.1H8.4v3.3h2.3V21h3.4v-6.5h2.4l.4-3.3h-2.8V9.5c0-.7.3-1 .9-1Z" />
    </svg>
  );
}
