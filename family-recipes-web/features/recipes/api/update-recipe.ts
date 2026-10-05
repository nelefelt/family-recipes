import { apiClient } from "@/lib/api/client";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import type { RecipeResponse, UpdateRecipeRequest } from "@/features/recipes/types/recipe";

export const updateRecipe = async (
  recipeId: number,
  request: UpdateRecipeRequest,
  accessToken: string,
): Promise<RecipeResponse> => {
  const { data, error, response } = await apiClient
    .PUT("/api/recipes/{recipeId}", {
      params: {
        path: { recipeId },
      },
      body: request,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .catch((networkError: unknown) => {
      throw new Error("Det gick inte att nå servern. Kontrollera anslutningen och försök igen.", {
        cause: networkError,
      });
    });

  if (!response.ok || data === undefined) {
    throw new RecipeRequestError(response.status, getUpdateRecipeErrorMessage(response.status), error);
  }

  return data;
};

function getUpdateRecipeErrorMessage(status: number): string {
  if (status === 400) return "Receptet kunde inte sparas. Kontrollera fälten och försök igen.";
  if (status === 401) return "Du behöver logga in igen för att redigera receptet.";
  if (status === 403) return "Du kan bara redigera dina egna recept.";
  if (status === 404) return "Receptet finns inte.";

  return "Receptet kunde inte sparas. Försök igen.";
}
