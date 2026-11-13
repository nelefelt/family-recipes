"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { recipeKeys } from "@/features/recipes/recipe-keys";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

// Fetches the latest version on request, for example after a 409. It refetches the active detail query
// so the cache updates too, and fails instead of returning the old cached recipe.
export const useReloadRecipe = (recipeId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RecipeResponse> => {
      const queryKey = recipeKeys.detail(recipeId);
      await queryClient.refetchQueries({ queryKey, exact: true }, { throwOnError: true });

      const recipe = queryClient.getQueryData<RecipeResponse>(queryKey);

      if (recipe === undefined) {
        throw new Error("The recipe is not in the cache after refetching.");
      }

      return recipe;
    },
  });
};
