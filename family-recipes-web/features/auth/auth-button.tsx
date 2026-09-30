"use client";

import { useState } from "react";
import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/features/auth/auth-config";

const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) return error.message;

  return "Authentication failed. Please try again.";
};

export function AuthButton() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isBusy = inProgress !== InteractionStatus.None;
  const account = accounts[0];

  const handleLogin = async () => {
    setErrorMessage(null);

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  const handleLogout = async () => {
    setErrorMessage(null);

    if (!account) return;

    try {
      await instance.logoutRedirect({ account });
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <div className="flex items-center gap-2">
      {errorMessage ? (
        <p role="alert" className="max-w-40 text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}

      {isAuthenticated ? (
        <Button
          type="button"
          variant="outline"
          className="h-11 px-3.5"
          onClick={() => void handleLogout()}
          disabled={isBusy}
        >
          Logga ut
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-11 px-3.5"
          onClick={() => void handleLogin()}
          disabled={isBusy}
        >
          Logga in
        </Button>
      )}
    </div>
  );
}
