"use client";

import { InteractionStatus } from "@azure/msal-browser";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { apiScope } from "@/features/auth/auth-config";
import { getOrCreateCurrentUser } from "@/features/users/api/get-or-create-current-user";

export const useCurrentUser = () => {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = instance.getActiveAccount() ?? accounts[0];
  const canLoadCurrentUser =
    isAuthenticated &&
    inProgress === InteractionStatus.None &&
    account !== undefined;

  return useQuery({
    queryKey: ["currentUser", account?.homeAccountId],
    enabled: canLoadCurrentUser,
    staleTime: Infinity,
    queryFn: async () => {
      if (!account) {
        throw new Error("No signed-in account is available.");
      }

      const tokenResponse = await instance.acquireTokenSilent({
        account,
        scopes: [apiScope],
      });

      return getOrCreateCurrentUser(tokenResponse.accessToken);
    },
  });
};
