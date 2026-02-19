import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirectTo?: string }>;
}) {
  const { error, redirectTo } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <LoginForm urlError={error} redirectTo={redirectTo} />
    </div>
  );
}
