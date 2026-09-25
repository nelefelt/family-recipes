"use client";

import { MsalProvider } from "@azure/msal-react";
import {
  PublicClientApplication,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { msalConfig } from "@/features/auth/auth-config";
import { useEffect, useState, type ReactNode } from "react";

let msalInstancePromise: Promise<IPublicClientApplication> | undefined;

const getMsalInstance = (): Promise<IPublicClientApplication> => {
  if (!msalInstancePromise) {
    msalInstancePromise = (async () => {
      const pca = new PublicClientApplication(msalConfig);
      await pca.initialize();
      return pca;
    })();
  }

  return msalInstancePromise;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [instance, setInstance] = useState<IPublicClientApplication | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const msalInstance = await getMsalInstance();

        if (isMounted) {
          setInstance(msalInstance);
        }
      } catch {
        if (isMounted) {
          setErrorMessage(
            "Authentication could not be started. Please refresh the page."
          );
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (errorMessage) {
    return <p role="alert">{errorMessage}</p>;
  }

  if (!instance) {
    return (
      <p role="status" aria-live="polite">
        Loading authentication...
      </p>
    );
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
