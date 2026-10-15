/**
 * The house mark: two lenses bridged by a brass bar, wrapped in the deco
 * arch of a theatre marquee. Drawn rather than imaged so it stays crisp at
 * every size and recolours with `currentColor` in the footer.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 32" fill="none" className={className} aria-hidden="true">
      <circle cx="17" cy="16" r="11" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="47" cy="16" r="11" stroke="currentColor" strokeWidth="1.6" />
      <path d="M28 14.5c2.6-1.6 5.4-1.6 8 0" stroke="#B08D4F" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M6 16H1M63 16h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center leading-none ${className}`}>
      <LogoMark className="h-5 w-auto mb-1.5" />
      <span className="display text-[1.05rem] tracking-[0.04em]">Broadway</span>
      <span className="label text-[0.5rem] text-brass mt-1">Opticals</span>
    </span>
  );
}
