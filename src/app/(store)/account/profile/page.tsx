import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/account/ProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
    select: { name: true, email: true, phone: true, createdAt: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <ProfileForm user={{ name: user.name, email: user.email, phone: user.phone }} />
      <p className="mt-8 text-xs text-ink-muted">
        Member since{" "}
        {user.createdAt.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
