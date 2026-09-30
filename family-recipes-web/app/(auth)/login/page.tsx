import type { Metadata } from "next";
import { GuestGuard } from "@/features/auth/components/guest-guard";
import { LoginScreen } from "@/features/auth/components/login-screen";
import { getSafeReturnUrl } from "@/features/auth/lib/return-url";

export const metadata: Metadata = {
  title: "Logga in · Nelefelts recept",
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
