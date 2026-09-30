"use client";

// Startar MSAL och gör autentiseringsinformationen tillgänglig i hela appen.

import { MsalProvider } from "@azure/msal-react";
import {
  EventType,
  InteractionType,
  PublicClientApplication,
  type IPublicClientApplication,
} from "@azure/msal-browser";
import { AppLoadingScreen } from "@/components/app/app-loading-screen";
import { msalConfig } from "@/features/auth/lib/auth-config";
import { saveLoginError } from "@/features/auth/lib/login-error";
import { useEffect, useState, type ReactNode } from "react";

let msalInstancePromise: Promise<IPublicClientApplication> | undefined;

const getMsalInstance = (): Promise<IPublicClientApplication> => {
  if (!msalInstancePromise) {
    msalInstancePromise = (async () => {
      const pca = new PublicClientApplication(msalConfig);
      await pca.initialize();
      // Must be registered before MsalProvider runs handleRedirectPromise, which swallows redirect errors.
      pca.addEventCallback((message) => {
        if (
          message.eventType === EventType.ACQUIRE_TOKEN_FAILURE &&
          message.interactionType === InteractionType.Redirect
        ) {
          saveLoginError(message.error);
        }
      });
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
            "Inloggningen kunde inte startas. Ladda om sidan och försök igen."
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
    return (
      <p role="alert" className="m-auto max-w-sm px-6 text-center text-sm text-destructive">
        {errorMessage}
      </p>
    );
  }

  if (!instance) {
    return <AppLoadingScreen />;
  }

  return <MsalProvider instance={instance}>{children}</MsalProvider>;
}
