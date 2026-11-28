"use client";

import { useEffect, useRef } from "react";

/**
 * Reveals its children once they scroll into view.
 *
 * An IntersectionObserver toggling one class, rather than a scroll handler:
 * the browser decides when to tell us, and nothing of ours runs between
 * frames. Each element is unobserved the moment it has appeared, so a long
 * page does not keep a hundred live observations open.
 *
 * `html.js` is set here rather than in the markup, so the CSS can leave the
 * content visible for anyone whose JavaScript never arrives — a reveal that
 * cannot fire must not be able to hide anything permanently.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Milliseconds, for staggering a group. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.disconnect();
      },
      // A little before the element's top edge arrives, so it is finished
      // moving by the time it is properly in the reader's view.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type across the handful of tags allowed above
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? ({ ["--reveal-delay" as string]: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
