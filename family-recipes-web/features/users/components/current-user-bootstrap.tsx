"use client";

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { type ReactNode } from "react";
import { AppLoadingScreen } from "@/components/app/app-loading-screen";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";

interface CurrentUserBootstrapProps {
  children: ReactNode;
}

export const CurrentUserBootstrap = ({ children }: CurrentUserBootstrapProps) => {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const currentUserQuery = useCurrentUser();

  if (inProgress !== InteractionStatus.None) {
    return <AppLoadingScreen />;
  }

  if (!isAuthenticated) {
    return children;
  }

  if (currentUserQuery.isPending) {
    return <AppLoadingScreen />;
  }

  if (currentUserQuery.isError) {
    return (
      <p role="alert" className="m-auto max-w-sm px-6 text-center text-sm text-destructive">
        Ditt konto kunde inte laddas. Ladda om sidan och försök igen.
      </p>
    );
  }

  return children;
};
