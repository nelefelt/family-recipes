import { apiClient } from "@/lib/api/client";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

export class RecipeRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "RecipeRequestError";
    this.status = status;
  }
}

export const getRecipe = async (recipeId: number, accessToken: string): Promise<RecipeResponse> => {
  const { data, error, response } = await apiClient
    .GET("/api/recipes/{recipeId}", {
      params: {
        path: { recipeId },
      },
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
    throw new RecipeRequestError(response.status, getRecipeErrorMessage(response.status), error);
  }

  return data;
};

function getRecipeErrorMessage(status: number): string {
  if (status === 404) return "Receptet finns inte.";
  if (status === 401 || status === 403) return "Du behöver logga in igen för att se receptet.";

  return "Receptet kunde inte hämtas. Försök igen.";
}
