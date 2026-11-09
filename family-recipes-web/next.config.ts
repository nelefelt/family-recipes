import type { NextConfig } from "next";

// Set only by playwright.config.ts. The deployed build never has this flag.
const isE2EBuild = process.env.E2E_BUILD === "1";

const nextConfig: NextConfig = isE2EBuild
  ? {
      distDir: ".next-e2e",
      turbopack: {
        resolveAlias: {
          "@azure/msal-react": "./e2e/support/fake-msal-react.tsx",
        },
      },
    }
  : {
      output: "standalone",
    };

export default nextConfig;
