"use client";

// Skyddar inloggningssidan från redan inloggade användare och skickar dem vidare till appen.

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppLoadingScreen } from "@/components/app/app-loading-screen";

interface GuestGuardProps {
  returnUrl: string;
  children: ReactNode;
}

export const GuestGuard = ({ returnUrl, children }: GuestGuardProps) => {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const isReady = inProgress === InteractionStatus.None;

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace(returnUrl);
  }, [isReady, isAuthenticated, returnUrl, router]);

  if (!isReady || isAuthenticated) return <AppLoadingScreen />;

  return children;
};
