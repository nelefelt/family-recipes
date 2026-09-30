import { apiClient } from "@/lib/api/client";
import type { CreateRecipeRequest, RecipeResponse } from "@/features/recipes/types/recipe";

export const createRecipe = async (
  request: CreateRecipeRequest,
  accessToken: string,
): Promise<RecipeResponse> => {
  const { data, error, response } = await apiClient
    .POST("/api/recipes", {
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

  if (error !== undefined || !response.ok || data === undefined) {
    throw new Error(getCreateRecipeErrorMessage(response.status), { cause: error });
  }

  return data;
};

function getCreateRecipeErrorMessage(status: number): string {
  if (status === 400) return "Receptet kunde inte sparas. Kontrollera fälten och försök igen.";
  if (status === 401 || status === 403) return "Du behöver logga in igen för att skapa recept.";

  return "Något gick fel när receptet skulle skapas. Försök igen.";
}
