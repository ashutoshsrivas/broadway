import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";

export const metadata: Metadata = { title: "Your Bag" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-5 py-12 lg:px-10 lg:py-16">
      <h1 className="display text-[clamp(2rem,5vw,3.25rem)]">Your Bag</h1>
      <hr className="rule-deco mt-6 mb-10" />
      <CartView />
    </div>
  );
}
