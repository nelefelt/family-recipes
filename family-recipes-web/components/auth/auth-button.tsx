"use client";

import { useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/lib/auth/auth-config";

function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;

  return "Authentication failed. Please try again.";
}

export function AuthButton() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBusy = inProgress !== InteractionStatus.None;
  const account = accounts[0];
  const accountLabel = account?.name ?? account?.username;

  function handleLogin() {
    setErrorMessage(null);
    instance.loginRedirect(loginRequest).catch((error: unknown) => {
      setErrorMessage(getAuthErrorMessage(error));
    });
  }

  function handleLogout() {
    setErrorMessage(null);

    if (!account) return;

    instance.logoutRedirect({ account }).catch((error: unknown) => {
      setErrorMessage(getAuthErrorMessage(error));
    });
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {isAuthenticated ? (
        <div className="flex flex-wrap items-center gap-3">
          {accountLabel ? <p>{accountLabel}</p> : null}
          <Button
            type="button"
            variant="secondary"
            onClick={handleLogout}
            disabled={isBusy}
          >
            Logga ut
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={handleLogin} disabled={isBusy}>
          Logga in
        </Button>
      )}
    </div>
  );
}
