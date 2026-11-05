import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, vi } from "vitest";
import { server } from "./server";

// Must run here, not in beforeAll: openapi-fetch keeps a reference to fetch when lib/api/client.ts
// is imported, and beforeAll runs after that import. The client would then bypass MSW.
server.listen({ onUnhandledFrame: "error" });

// Replaces Entra sign-in. The real getAccessToken still runs, against this fake instance.
vi.mock("@azure/msal-react", async () => {
  const { InteractionStatus } = await import("@azure/msal-browser");
  const account = { homeAccountId: "test-account" };
  const instance = {
    getActiveAccount: () => account,
    acquireTokenSilent: async () => ({ accessToken: "test-token" }),
  };

  return {
    useMsal: () => ({ instance, accounts: [account], inProgress: InteractionStatus.None }),
    useIsAuthenticated: () => true,
  };
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
