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
  version: "AAAAAAAAB9E=",
};

const changedElsewhere: RecipeResponse = {
  ...existingRecipe,
  title: "Titel från annan flik",
  version: "AAAAAAAAB9I=",
};

const conflictResponse = () =>
  HttpResponse.json({ status: 409, title: "Recipe conflict" }, { status: 409 });

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
      version: existingRecipe.version,
    });
    expect(queryClient.getQueryData<RecipeResponse>(recipeKeys.detail(recipeId))?.title).toBe("Ny titel");

    // Stands in for the navigation. getByRole does not wait, so the title must already be in the
    // cache: a refetch could not have finished yet.
    rerender(<RecipeDetail recipeId={recipeId} />);

    expect(screen.getByRole("heading", { level: 1, name: "Ny titel" })).toBeInTheDocument();
  });

  it("keeps the unsaved changes and the original version when the recipe is refetched in the background", async () => {
    let storedRecipe = existingRecipe;
    let requestBody: UpdateRecipeRequest | undefined;
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      http.get(recipeUrl, () => HttpResponse.json(storedRecipe)),
      http.put(recipeUrl, async ({ request }) => {
        requestBody = (await request.json()) as UpdateRecipeRequest;

        return conflictResponse();
      }),
    );
    const { user, queryClient } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);

    const titleInput = await screen.findByLabelText("Titel");
    await user.clear(titleInput);
    await user.type(titleInput, "Min ändring");

    storedRecipe = changedElsewhere;
    await queryClient.refetchQueries({ queryKey: recipeKeys.detail(recipeId) });

    expect(screen.getByLabelText("Titel")).toHaveValue("Min ändring");

    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));

    await waitFor(() => expect(requestBody?.version).toBe(existingRecipe.version));
  });

  it("shows the conflict and loads the latest version only when the user asks for it", async () => {
    let storedRecipe = existingRecipe;
    const savedVersions: string[] = [];
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      http.get(recipeUrl, () => HttpResponse.json(storedRecipe)),
      http.put(recipeUrl, async ({ request }) => {
        const body = (await request.json()) as UpdateRecipeRequest;
        savedVersions.push(body.version);

        return body.version === storedRecipe.version
          ? HttpResponse.json({ ...storedRecipe, title: body.title })
          : conflictResponse();
      }),
    );
    const { user } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);

    const titleInput = await screen.findByLabelText("Titel");
    await user.clear(titleInput);
    await user.type(titleInput, "Min ändring");
    storedRecipe = changedElsewhere;
    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));

    expect(await screen.findByText(/Receptet har ändrats sedan du öppnade det/)).toBeInTheDocument();
    expect(screen.getByLabelText("Titel")).toHaveValue("Min ändring");

    await user.click(screen.getByRole("button", { name: "Ladda senaste versionen" }));

    await waitFor(() => expect(screen.getByLabelText("Titel")).toHaveValue("Titel från annan flik"));
    expect(screen.queryByText(/Receptet har ändrats sedan du öppnade det/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith(`/recipes/${recipeId}`));
    expect(savedVersions).toEqual([existingRecipe.version, changedElsewhere.version]);
  });

  it("cannot be saved while the latest version is loading", async () => {
    let releaseReload: () => void = () => {};
    let delayRecipeRequests = false;
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      http.get(recipeUrl, async () => {
        if (delayRecipeRequests) {
          await new Promise<void>((resolve) => {
            releaseReload = resolve;
          });
        }

        return HttpResponse.json(changedElsewhere);
      }),
      http.put(recipeUrl, () => conflictResponse()),
    );
    const { user } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);

    await screen.findByLabelText("Titel");
    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));
    await screen.findByRole("button", { name: "Ladda senaste versionen" });

    delayRecipeRequests = true;
    await user.click(screen.getByRole("button", { name: "Ladda senaste versionen" }));

    expect(await screen.findByRole("button", { name: "Hämtar..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Spara ändringar" })).toBeDisabled();

    releaseReload();

    await waitFor(() => expect(screen.getByRole("button", { name: "Spara ändringar" })).toBeEnabled());
  });

  it("starts a new edit session when switching to another recipe", async () => {
    const otherRecipe: RecipeResponse = { ...existingRecipe, id: 8, title: "Annat recept", version: "AAAAAAAAB9M=" };
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      http.get(recipeUrl, () => HttpResponse.json(existingRecipe)),
      http.get(`${apiBaseUrl}/api/recipes/${otherRecipe.id}`, () => HttpResponse.json(otherRecipe)),
    );
    const { queryClient, rerender } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);
    expect(await screen.findByLabelText("Titel")).toHaveValue("Gammal titel");

    // Already cached, so the form renders at once without a loading state in between.
    queryClient.setQueryData(recipeKeys.detail(otherRecipe.id), otherRecipe);
    rerender(<EditRecipeForm recipeId={otherRecipe.id} />);

    expect(screen.getByLabelText("Titel")).toHaveValue("Annat recept");
  });

  it("keeps the unsaved changes when loading the latest version fails", async () => {
    let failRecipeRequests = false;
    server.use(
      http.put(`${apiBaseUrl}/api/users/me`, () => HttpResponse.json(currentUser)),
      // 404 is not retried by useRecipe, so the failure shows without waiting for retries.
      http.get(recipeUrl, () =>
        failRecipeRequests ? HttpResponse.json({}, { status: 404 }) : HttpResponse.json(existingRecipe),
      ),
      http.put(recipeUrl, () => conflictResponse()),
    );
    const { user } = renderWithProviders(<EditRecipeForm recipeId={recipeId} />);

    const titleInput = await screen.findByLabelText("Titel");
    await user.clear(titleInput);
    await user.type(titleInput, "Min ändring");
    await user.click(screen.getByRole("button", { name: "Spara ändringar" }));
    await screen.findByRole("button", { name: "Ladda senaste versionen" });

    failRecipeRequests = true;
    await user.click(screen.getByRole("button", { name: "Ladda senaste versionen" }));

    expect(await screen.findByText(/Den senaste versionen kunde inte hämtas/)).toBeInTheDocument();
    expect(screen.getByLabelText("Titel")).toHaveValue("Min ändring");
  });
});
