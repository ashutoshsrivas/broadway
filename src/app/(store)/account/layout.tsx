import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/account");

  return (
    <div className="mx-auto max-w-[1300px] px-5 py-12 lg:px-10 lg:py-16">
      <p className="label text-brass">My Account</p>
      <h1 className="display mt-3 text-[clamp(2rem,5vw,3.25rem)]">
        Hello, {session.user.name?.split(" ")[0] ?? "there"}
      </h1>
      <hr className="rule-deco mt-6 mb-10" />

      <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
