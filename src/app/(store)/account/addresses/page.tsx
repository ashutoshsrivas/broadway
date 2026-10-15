import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddressManager } from "@/components/account/AddressManager";

export default async function AddressesPage() {
  const session = await auth();
  const addresses = await db.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressManager initial={addresses} />;
}
