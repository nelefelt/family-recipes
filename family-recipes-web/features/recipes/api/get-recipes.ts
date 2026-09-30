import { apiClient } from "@/lib/api/client";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

export const getRecipes = async (accessToken: string): Promise<RecipeResponse[]> => {
  const { data, error, response } = await apiClient
    .GET("/api/recipes", {
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
    throw new Error(getRecipesErrorMessage(response.status), { cause: error });
  }

  return data;
};

function getRecipesErrorMessage(status: number): string {
  if (status === 401 || status === 403) return "Du behöver logga in igen för att se recepten.";

  return "Recepten kunde inte hämtas. Försök igen.";
}
