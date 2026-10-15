import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Editorial panel — dropped on phones, where it would push the form
          below the fold for no benefit. */}
      <aside className="relative hidden overflow-hidden bg-forest text-paper grain lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:p-14">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-6 w-auto text-paper" />
          <span className="display text-lg tracking-[0.08em]">BROADWAY</span>
        </Link>

        <div>
          <p className="label text-brass">Est. 1974</p>
          <p className="display mt-5 text-4xl leading-[1.1]">
            Fifty years of
            <br />
            <em className="text-brass-soft">looking closer.</em>
          </p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/60">
            Sign in to track your orders, save your addresses, and keep your prescription on file
            for your next pair.
          </p>
        </div>

        <p className="label text-paper/30">Connaught Place · New Delhi</p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-14">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex flex-col items-center lg:hidden">
            <LogoMark className="h-5 w-auto" />
            <span className="display mt-2 text-lg tracking-[0.06em]">BROADWAY</span>
            <span className="label mt-1 text-[0.5rem] text-brass">Opticals</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
