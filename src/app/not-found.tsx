import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <LogoMark className="h-8 w-auto text-ink" />
      <p className="label mt-10 text-brass">Error 404</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,8vw,5rem)]">
        Out of <em>focus.</em>
      </h1>
      <p className="mt-5 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
        This page isn&rsquo;t where you left it. Let&rsquo;s get you back to something you can see.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-ink label px-10 py-4">
          Back Home
        </Link>
        <Link href="/shop" className="btn-outline label px-10 py-4">
          Browse Frames
        </Link>
      </div>
    </div>
  );
}
