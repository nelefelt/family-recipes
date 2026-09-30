"use client";

import { useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { apiScope } from "@/features/auth/lib/auth-config";
import { getRecipes } from "@/features/recipes/api/get-recipes";

export const useRecipes = () => {
  const { instance, accounts } = useMsal();

  return useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const account = instance.getActiveAccount() ?? accounts[0];

      if (!account) {
        throw new Error("Du behöver logga in för att se recepten.");
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

      return getRecipes(tokenResponse.accessToken);
    },
  });
};
