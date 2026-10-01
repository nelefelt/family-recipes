import { apiClient } from "@/lib/api/client";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";

export const deleteRecipe = async (recipeId: number, accessToken: string): Promise<void> => {
  const { error, response } = await apiClient
    .DELETE("/api/recipes/{recipeId}", {
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

  if (!response.ok) {
    throw new RecipeRequestError(response.status, getDeleteRecipeErrorMessage(response.status), error);
  }
};

function getDeleteRecipeErrorMessage(status: number): string {
  if (status === 404) return "Receptet finns inte.";
  if (status === 403) return "Du kan bara radera dina egna recept.";
  if (status === 401) return "Du behöver logga in igen för att radera receptet.";

  return "Receptet kunde inte raderas. Försök igen.";
}
