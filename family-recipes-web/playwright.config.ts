import { defineConfig, devices } from "@playwright/test";
import { e2eApiUrl as apiUrl, testUsers } from "./e2e/support/test-users";

const webPort = 3100;
const webUrl = `http://localhost:${webPort}`;
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
    // Every test is signed in as Anna unless it opens its own context, see e2e/support/test-users.ts.
    extraHTTPHeaders: testUsers.anna,
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
