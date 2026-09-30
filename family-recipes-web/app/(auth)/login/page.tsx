import type { Metadata } from "next";
import { GuestGuard } from "@/features/auth/guest-guard";
import { LoginScreen } from "@/features/auth/login-screen";
import { getSafeReturnUrl } from "@/features/auth/return-url";

export const metadata: Metadata = {
  title: "Logga in · Familjerecept",
};

interface LoginPageProps {
  searchParams: Promise<{ returnUrl?: string | string[] }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { returnUrl } = await searchParams;
  const safeReturnUrl = getSafeReturnUrl(returnUrl);

  return (
    <GuestGuard returnUrl={safeReturnUrl}>
      <LoginScreen returnUrl={safeReturnUrl} />
    </GuestGuard>
  );
}
