"use client";

// Renderar själva inloggningssidan och startar loginRedirect när användaren klickar.

import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { ChefHat, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/features/auth/lib/auth-config";
import { clearLoginError, readLoginError } from "@/features/auth/lib/login-error";

interface LoginScreenProps {
  returnUrl: string;
}

export const LoginScreen = ({ returnUrl }: LoginScreenProps) => {
  const { instance, inProgress } = useMsal();
  const [errorMessage, setErrorMessage] = useState<string | null>(() => readLoginError());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isBusy = isRedirecting || inProgress !== InteractionStatus.None;

  useEffect(() => {
    clearLoginError();
  }, []);

  const handleLogin = async () => {
    setErrorMessage(null);
    setIsRedirecting(true);

    try {
      await instance.loginRedirect({
        ...loginRequest,
        redirectStartPage: new URL(returnUrl, window.location.origin).toString(),
      });
    } catch {
      clearLoginError();
      setErrorMessage("Inloggningen kunde inte startas. Försök igen.");
      setIsRedirecting(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm ring-1 ring-primary/5">
          <ChefHat aria-hidden="true" className="size-7" />
        </div>
        <p className="mt-4 text-sm font-semibold tracking-tight text-foreground">Nelefelts recept</p>

        <h1 className="mt-10 font-heading text-4xl leading-[1.1] font-medium tracking-tight text-balance text-foreground">
          Familjens smaker, samlade.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-muted-foreground">
          Logga in för att se, spara och dela familjens bästa recept.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {errorMessage ? (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        ) : null}

        <Button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isBusy}
          className="h-14 w-full rounded-2xl text-base font-semibold shadow-md shadow-primary/15 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-primary/20 active:translate-y-0 disabled:translate-y-0 disabled:bg-primary disabled:opacity-80"
        >
          {isBusy ? (
            <>
              <Loader2 aria-hidden="true" className="animate-spin" />
              Loggar in...
            </>
          ) : (
            "Logga in"
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">Du loggas in säkert via Microsoft.</p>
      </div>
    </main>
  );
};
