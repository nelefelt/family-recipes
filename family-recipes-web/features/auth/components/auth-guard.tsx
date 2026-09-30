"use client";

// Skyddar privata sidor. Utloggade användare skickas till /login.

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AppLoadingScreen } from "@/components/app/app-loading-screen";

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const isReady = inProgress === InteractionStatus.None;

  useEffect(() => {
    if (!isReady || isAuthenticated) return;

    const returnUrl = `${window.location.pathname}${window.location.search}`;
    router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !isAuthenticated) return <AppLoadingScreen />;

  return children;
};
