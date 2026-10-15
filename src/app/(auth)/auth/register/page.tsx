import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/account/RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="display text-4xl">Create your account</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Track orders, save addresses, and keep your prescription on file.
      </p>
      <hr className="rule-deco my-8" />

      <RegisterForm />

      <p className="mt-8 text-center text-sm text-ink-soft">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-brass link-rule">
          Sign in
        </Link>
      </p>
    </>
  );
}
