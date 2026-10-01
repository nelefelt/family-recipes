"use client";

import { useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { createRecipe } from "@/features/recipes/api/create-recipe";
import { recipeKeys } from "@/features/recipes/recipe-keys";
import type { CreateRecipeRequest } from "@/features/recipes/types/recipe";

export const useCreateRecipe = () => {
  const { instance, accounts } = useMsal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateRecipeRequest) => {
      const accessToken = await getAccessToken(instance, accounts);

      return createRecipe(request, accessToken);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recipeKeys.all }),
  });
};
