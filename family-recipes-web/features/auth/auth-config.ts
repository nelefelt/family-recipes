import { BrowserCacheLocation, type Configuration } from "@azure/msal-browser";

const requireEnv = (value: string | undefined, name: string): string => {
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const clientId = requireEnv(
  process.env.NEXT_PUBLIC_MSAL_CLIENT_ID,
  "NEXT_PUBLIC_MSAL_CLIENT_ID"
);
const authority = requireEnv(
  process.env.NEXT_PUBLIC_MSAL_AUTHORITY,
  "NEXT_PUBLIC_MSAL_AUTHORITY"
);
const redirectUri = requireEnv(
  process.env.NEXT_PUBLIC_MSAL_REDIRECT_URI,
  "NEXT_PUBLIC_MSAL_REDIRECT_URI"
);

export const apiScope = requireEnv(
  process.env.NEXT_PUBLIC_API_SCOPE,
  "NEXT_PUBLIC_API_SCOPE"
);

export const apiBaseUrl = requireEnv(
  process.env.NEXT_PUBLIC_API_BASE_URL,
  "NEXT_PUBLIC_API_BASE_URL"
);

const getKnownAuthorities = (authorityUrl: string): string[] => {
  const url = new URL(authorityUrl);
  const knownAuthorities = [url.hostname];
  const tenantSegment = url.pathname.split("/").filter(Boolean)[0];
  const guidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (tenantSegment && guidPattern.test(tenantSegment)) {
    const guidHost = `${tenantSegment.toLowerCase()}.ciamlogin.com`;
    if (!knownAuthorities.includes(guidHost)) knownAuthorities.push(guidHost);
  }

  return knownAuthorities;
};

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    knownAuthorities: getKnownAuthorities(authority),
    redirectUri,
    postLogoutRedirectUri: redirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
  },
};

export const loginRequest = {
  scopes: [apiScope],
};
