"use client";

import { useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiScope } from "@/features/auth/auth-config";
import { createRecipe } from "@/features/recipes/api/create-recipe";
import type { CreateRecipeRequest } from "@/features/recipes/types/recipe";

export const useCreateRecipe = () => {
  const { instance, accounts } = useMsal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRecipeRequest) => {
      const account = instance.getActiveAccount() ?? accounts[0];

      if (!account) {
        throw new Error("Du behöver logga in för att skapa recept.");
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

      return createRecipe(request, tokenResponse.accessToken);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] }),
  });
};
