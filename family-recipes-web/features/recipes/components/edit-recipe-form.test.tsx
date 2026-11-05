import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { apiBaseUrl } from "@/features/auth/lib/auth-config";
import { EditRecipeForm } from "@/features/recipes/components/edit-recipe-form";
import { RecipeDetail } from "@/features/recipes/components/recipe-detail";
import { recipeKeys } from "@/features/recipes/recipe-keys";
import type { RecipeResponse, UpdateRecipeRequest } from "@/features/recipes/types/recipe";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/server";

// vi.mock is moved above the imports, so the mock function must be created with vi.hoisted.
const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

const recipeId = 7;
const recipeUrl = `${apiBaseUrl}/api/recipes/${recipeId}`;
const currentUser = { id: 1, name: "Test" };

const existingRecipe: RecipeResponse = {
  id: recipeId,
  title: "Gammal titel",
  description: null,
  instructions: "Koka pastan",
  createdByUserId: currentUser.id,
  createdByUserName: currentUser.name,
  createdAt: "2026-01-01T12:00:00Z",
  updatedAt: "2026-01-01T12:00:00Z",
  ingredients: [{ id: 1, name: "Pasta", amount: 250, unit: "g" }],
};

describe("EditRecipeForm", () => {
  it("saves the change, navigates to the recipe and shows the new title from the cache", async () => {
    let storedRecipe = existingRecipe;
    let requestBody: UpdateRecipeRequest | undefined;
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      http.get(recipeUrl, () => HttpResponse.json(storedRecipe)),
      http.put(recipeUrl, async ({ request }) => {
        requestBody = (await request.json()) as UpdateRecipeRequest;
        storedRecipe = { ...storedRecipe, title: requestBody.title };

        return HttpResponse.json(storedRecipe);
      }),
    );
    const { user, queryClient, rerender } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);

    const titleInput = await screen.findByLabelText("Titel");
    expect(titleInput).toHaveValue("Gammal titel");

    await user.clear(titleInput);
    await user.type(titleInput, "Ny titel");
    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith(`/recipes/${recipeId}`));
    expect(requestBody).toEqual({
      title: "Ny titel",
      description: null,
      instructions: "Koka pastan",
      ingredients: [{ name: "Pasta", amount: 250, unit: "g" }],
    });
    expect(queryClient.getQueryData<RecipeResponse>(recipeKeys.detail(recipeId))?.title).toBe("Ny titel");

    // Stands in for the navigation. getByRole does not wait, so the title must already be in the
    // cache: a refetch could not have finished yet.
    rerender(<RecipeDetail recipeId={recipeId} />);

    expect(screen.getByRole("heading", { level: 1, name: "Ny titel" })).toBeInTheDocument();
  });
});
