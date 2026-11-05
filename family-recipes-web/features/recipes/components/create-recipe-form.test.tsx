import { screen, waitFor } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { apiBaseUrl } from "@/features/auth/lib/auth-config";
import { CreateRecipeForm } from "@/features/recipes/components/create-recipe-form";
import type { CreateRecipeRequest, RecipeResponse } from "@/features/recipes/types/recipe";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/server";

const recipesUrl = `${apiBaseUrl}/api/recipes`;

const createdRecipe: RecipeResponse = {
  id: 1,
  title: "Lasagne",
  description: null,
  instructions: "Koka pastan",
  createdByUserId: 1,
  createdByUserName: "Test",
  createdAt: "2026-01-01T12:00:00Z",
  updatedAt: "2026-01-01T12:00:00Z",
  ingredients: [{ id: 1, name: "Pasta", amount: null, unit: null }],
};

const fillIngredientAndStep = async (user: UserEvent) => {
  await user.type(screen.getByLabelText("Ingrediens"), "Pasta");
  await user.type(screen.getByLabelText("Steg 1"), "Koka pastan");
};

describe("CreateRecipeForm", () => {
  it("shows a title error, sends no request and keeps the input when the title is empty", async () => {
    let createRequestCount = 0;
    server.use(
      http.post(recipesUrl, () => {
        createRequestCount += 1;

        return HttpResponse.json(createdRecipe, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<CreateRecipeForm />);

    await fillIngredientAndStep(user);
    await user.click(screen.getByRole("button", { name: "Skapa recept" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ange en titel.");
    expect(createRequestCount).toBe(0);
    expect(screen.getByLabelText("Ingrediens")).toHaveValue("Pasta");
    expect(screen.getByLabelText("Steg 1")).toHaveValue("Koka pastan");
  });

  it("shows an error, keeps the input and lets the user retry when saving fails", async () => {
    server.use(http.post(recipesUrl, () => new HttpResponse(null, { status: 500 })));
    const { user } = renderWithProviders(<CreateRecipeForm />);

    await user.type(screen.getByLabelText("Titel"), "Lasagne");
    await fillIngredientAndStep(user);
    await user.click(screen.getByRole("button", { name: "Skapa recept" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Något gick fel när receptet skulle skapas. Försök igen.",
    );
    expect(screen.getByLabelText("Titel")).toHaveValue("Lasagne");
    expect(screen.getByLabelText("Ingrediens")).toHaveValue("Pasta");
    expect(screen.getByLabelText("Steg 1")).toHaveValue("Koka pastan");

    const saveButton = screen.getByRole("button", { name: "Skapa recept" });
    expect(saveButton).toBeEnabled();

    // The server has recovered, so the same input can be sent again.
    server.use(http.post(recipesUrl, () => HttpResponse.json(createdRecipe, { status: 201 })));
    await user.click(saveButton);

    await waitFor(() => expect(screen.getByLabelText("Titel")).toHaveValue(""));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  // Guards the test above: "no request" only means something if requests from the form reach MSW.
  it("sends a valid recipe through the real API client", async () => {
    let requestBody: CreateRecipeRequest | undefined;
    let authorization: string | null = null;
    server.use(
      http.post(recipesUrl, async ({ request }) => {
        requestBody = (await request.json()) as CreateRecipeRequest;
        authorization = request.headers.get("Authorization");

        return HttpResponse.json(createdRecipe, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<CreateRecipeForm />);

    await user.type(screen.getByLabelText("Titel"), "Lasagne");
    await fillIngredientAndStep(user);
    await user.click(screen.getByRole("button", { name: "Skapa recept" }));

    // The form resets in onSuccess, so an empty title means the whole flow has finished.
    await waitFor(() => expect(screen.getByLabelText("Titel")).toHaveValue(""));

    expect(requestBody).toEqual({
      title: "Lasagne",
      description: null,
      instructions: "Koka pastan",
      ingredients: [{ name: "Pasta", amount: null, unit: null }],
    });
    expect(authorization).toBe("Bearer test-token");
  });
});
