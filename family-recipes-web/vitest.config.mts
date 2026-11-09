import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    // Playwright owns e2e/, and its spec files would otherwise match the Vitest pattern.
    exclude: [...configDefaults.exclude, "e2e/**"],
    // auth-config.ts throws on import if these are missing. They are fake values, no test reaches Entra.
    env: {
      NEXT_PUBLIC_MSAL_CLIENT_ID: "test-client-id",
      NEXT_PUBLIC_MSAL_AUTHORITY: "https://login.test/test-tenant",
      NEXT_PUBLIC_MSAL_REDIRECT_URI: "http://localhost:3000/",
      NEXT_PUBLIC_API_SCOPE: "api://test/access_as_user",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:5133",
    },
  },
});
