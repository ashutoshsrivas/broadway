import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, isAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoMark } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/admin");

  // The role is re-read from the database rather than trusted from the session
  // token, so revoking admin takes effect on the next page load.
  if (!(await isAdmin())) redirect("/");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-paper/10 bg-ink text-paper lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-6 py-5 lg:block">
          <Link href="/admin" className="flex items-center gap-3">
            <LogoMark className="h-5 w-auto text-paper" />
            <span className="display text-base tracking-[0.08em]">BROADWAY</span>
          </Link>
          <p className="label mt-0 text-[0.55rem] text-brass lg:mt-2">Admin</p>
        </div>
        <AdminNav />
      </aside>

      <main className="flex-1 bg-paper px-5 py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}
