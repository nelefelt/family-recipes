"use client";

import { useMsal } from "@azure/msal-react";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { getRecipes } from "@/features/recipes/api/get-recipes";
import { recipeKeys } from "@/features/recipes/recipe-keys";

export const useRecipes = () => {
  const { instance, accounts } = useMsal();

  return useQuery({
    queryKey: recipeKeys.all,
    queryFn: async () => {
      const accessToken = await getAccessToken(instance, accounts);

      return getRecipes(accessToken);
    },
  });
};
