const NOTICES = [
  "Complimentary shipping on orders above ₹2,000",
  "Free lens fitting & frame adjustment at all stores",
  "100% authentic — every frame ships with its brand warranty",
  "Book a free eye test in-store",
];

/**
 * Marquee bar. Two identical tracks sit side by side and the pair slides left
 * by exactly half its width, so the loop has no visible seam. Hovering pauses
 * it, because a notice that can't be read is just motion.
 */
export function AnnouncementBar() {
  const track = (
    <ul className="flex shrink-0 items-center animate-marquee">
      {NOTICES.map((notice) => (
        <li key={notice} className="label flex items-center whitespace-nowrap px-8 py-2.5 text-paper/80">
          <span className="mr-8 text-brass">◆</span>
          {notice}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee-host overflow-hidden bg-ink" aria-label="Store notices">
      <div className="flex w-max" style={{ ["--marquee-duration" as string]: "46s" }}>
        {track}
        {/* Duplicate is decorative only — screen readers hear the list once. */}
        <div aria-hidden="true" className="contents">
          {track}
        </div>
      </div>
    </div>
  );
}
