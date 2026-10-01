import { type AccountInfo, type IPublicClientApplication } from "@azure/msal-browser";
import { apiScope } from "@/features/auth/lib/auth-config";

export async function getAccessToken(
  instance: IPublicClientApplication,
  accounts: AccountInfo[],
): Promise<string> {
  const account = instance.getActiveAccount() ?? accounts[0];

  if (!account) {
    throw new Error("Du behöver logga in igen.");
  }

  const tokenResponse = await instance
    .acquireTokenSilent({
      account,
      scopes: [apiScope],
    })
    .catch((tokenError: unknown) => {
      throw new Error("Din inloggning har gått ut. Logga in igen och försök på nytt.", {
        cause: tokenError,
      });
    });

  return tokenResponse.accessToken;
}
