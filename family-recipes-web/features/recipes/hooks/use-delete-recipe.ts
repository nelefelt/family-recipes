"use client";

import { useMsal } from "@azure/msal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { deleteRecipe } from "@/features/recipes/api/delete-recipe";
import { recipeKeys } from "@/features/recipes/recipe-keys";

export const useDeleteRecipe = () => {
  const { instance, accounts } = useMsal();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipeId: number) => {
      const accessToken = await getAccessToken(instance, accounts);

      return deleteRecipe(recipeId, accessToken);
    },
    onSuccess: async (_data, recipeId) => {
      await queryClient.invalidateQueries({
        queryKey: recipeKeys.all,
        exact: true,
      });

      queryClient.removeQueries({
        queryKey: recipeKeys.detail(recipeId),
      });
    },
  });
};
