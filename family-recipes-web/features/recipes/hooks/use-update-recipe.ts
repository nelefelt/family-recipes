"use client";

import { useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { updateRecipe } from "@/features/recipes/api/update-recipe";
import { recipeKeys } from "@/features/recipes/recipe-keys";
import type { UpdateRecipeRequest } from "@/features/recipes/types/recipe";

export const useUpdateRecipe = (recipeId: number) => {
  const { instance, accounts } = useMsal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateRecipeRequest) => {
      const accessToken = await getAccessToken(instance, accounts);

      return updateRecipe(recipeId, request, accessToken);
    },
    onSuccess: async (updatedRecipe) => {
      queryClient.setQueryData(recipeKeys.detail(recipeId), updatedRecipe);

      await queryClient.invalidateQueries({
        queryKey: recipeKeys.all,
        exact: true,
      });
    },
  });
};
