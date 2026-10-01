"use client";

import { useMsal } from "@azure/msal-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { getRecipe } from "@/features/recipes/api/get-recipe";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import { recipeKeys } from "@/features/recipes/recipe-keys";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

export const useRecipe = (recipeId: number) => {
  const { instance, accounts } = useMsal();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: recipeKeys.detail(recipeId),
    // The list cache stores full recipes today. A summary response would not be enough to render this view.
    placeholderData: () =>
      queryClient.getQueryData<RecipeResponse[]>(recipeKeys.all)?.find((recipe) => recipe.id === recipeId),
    retry: (failureCount, error) => {
      if (error instanceof RecipeRequestError && error.status < 500) {
        return false;
      }

      return failureCount < 2;
    },
    queryFn: async () => {
      const accessToken = await getAccessToken(instance, accounts);

      return getRecipe(recipeId, accessToken);
    },
  });
};
