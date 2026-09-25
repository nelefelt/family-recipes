"use client";

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { type ReactNode } from "react";
import { useCurrentUser } from "@/features/users/hooks/use-current-user";

interface CurrentUserBootstrapProps {
  children: ReactNode;
}

export const CurrentUserBootstrap = ({ children }: CurrentUserBootstrapProps) => {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const currentUserQuery = useCurrentUser();

  if (inProgress !== InteractionStatus.None) {
    return (
      <p role="status" aria-live="polite">
        Loading authentication...
      </p>
    );
  }

  if (!isAuthenticated) {
    return children;
  }

  if (currentUserQuery.isPending) {
    return (
      <p role="status" aria-live="polite">
        Loading your account...
      </p>
    );
  }

  if (currentUserQuery.isError) {
    return <p role="alert">Your account could not be loaded. Please try again.</p>;
  }

  return children;
};
