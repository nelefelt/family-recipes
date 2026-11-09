import { defineConfig, devices } from "@playwright/test";

const webPort = 3100;
const apiPort = 5199;
const webUrl = `http://localhost:${webPort}`;
const apiUrl = `http://localhost:${apiPort}`;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // One test at a time is easiest to debug. Tests create their own data, so this can be raised later.
  workers: 1,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: webUrl,
    trace: "on-first-retry",
    // TestAuthHandler in the E2E API turns these into the signed-in user.
    extraHTTPHeaders: {
      "X-Test-User-Id": "e2e-user-anna",
      "X-Test-User-Name": "Anna Testsson",
      "X-Test-Scope": "access_as_user",
    },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Playwright runs these commands, waits until each URL responds, and stops them after the run.
  webServer: [
    {
      command: "dotnet run --project ../tests/FamilyRecipes.Api.E2EHost",
      url: `${apiUrl}/health`,
      reuseExistingServer: !isCi,
      timeout: 240_000,
      env: {
        Cors__AllowedOrigins__0: webUrl,
      },
    },
    {
      command: `npm run build && npm run start -- --port ${webPort}`,
      url: webUrl,
      reuseExistingServer: !isCi,
      timeout: 240_000,
      // Fake values: nothing here reaches Entra. auth-config.ts only requires that they exist.
      env: {
        // Swaps in the fake sign-in, see next.config.ts. This must stay the only place that sets it.
        E2E_BUILD: "1",
        NEXT_PUBLIC_MSAL_CLIENT_ID: "00000000-0000-0000-0000-000000000000",
        NEXT_PUBLIC_MSAL_AUTHORITY: "https://login.test/test-tenant",
        NEXT_PUBLIC_MSAL_REDIRECT_URI: `${webUrl}/`,
        NEXT_PUBLIC_API_SCOPE: "api://test/access_as_user",
        NEXT_PUBLIC_API_BASE_URL: apiUrl,
      },
    },
  ],
});
