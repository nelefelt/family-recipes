"use client";

// Replaces @azure/msal-react in E2E builds only, see next.config.ts. Never used by the deployed app.
// The package job fails if the marker below is found in the build, so keep it in the runtime code.

import { InteractionStatus } from "@azure/msal-browser";
import type { ReactNode } from "react";

const account = { homeAccountId: "e2e-fake-auth", username: "e2e@test.local" };

// A test sets this key before the page loads to see the app as a signed-out visitor.
const isSignedOut = () => window.sessionStorage.getItem("e2e-signed-out") === "true";

const instance = {
  getActiveAccount: () => (isSignedOut() ? null : account),
  acquireTokenSilent: async () => ({ accessToken: "e2e-token" }),
  loginRedirect: async () => {},
  logoutRedirect: async () => {},
};

export const MsalProvider = ({ children }: { instance: unknown; children: ReactNode }) => children;

export const useMsal = () => ({
  instance,
  accounts: isSignedOut() ? [] : [account],
  inProgress: InteractionStatus.None,
});

export const useIsAuthenticated = () => !isSignedOut();
