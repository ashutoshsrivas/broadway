import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <>
      <h1 className="display text-4xl">Welcome back</h1>
      <p className="mt-3 text-sm text-ink-soft">Sign in to your Broadway Opticals account.</p>
      <hr className="rule-deco my-8" />

      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-8 text-center text-sm text-ink-soft">
        New here?{" "}
        <Link href="/auth/register" className="text-brass link-rule">
          Create an account
        </Link>
      </p>
    </>
  );
}
