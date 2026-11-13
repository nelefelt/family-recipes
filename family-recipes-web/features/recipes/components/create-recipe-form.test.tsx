import { screen, waitFor } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiBaseUrl } from "@/features/auth/lib/auth-config";
import { CreateRecipeForm } from "@/features/recipes/components/create-recipe-form";
import type { CreateRecipeRequest, RecipeResponse } from "@/features/recipes/types/recipe";
import { renderWithProviders } from "@/test/render-with-providers";
import { server } from "@/test/server";

// vi.mock is moved above the imports, so the mock function must be created with vi.hoisted.
const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

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
  version: "AAAAAAAAB9E=",
  ingredients: [{ id: 1, name: "Pasta", amount: null, unit: null }],
};

const fillIngredientAndStep = async (user: UserEvent) => {
  await user.type(screen.getByLabelText("Ingrediens"), "Pasta");
  await user.type(screen.getByLabelText("Steg 1"), "Koka pastan");
};

describe("CreateRecipeForm", () => {
  beforeEach(() => {
    routerReplace.mockClear();
  });

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
    await user.click(screen.getByRole("button", { name: "Spara" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ange en titel.");
    expect(createRequestCount).toBe(0);
    expect(screen.getByLabelText("Ingrediens")).toHaveValue("Pasta");
    expect(screen.getByLabelText("Steg 1")).toHaveValue("Koka pastan");
  });

  it("shows an error, keeps the input and lets the user retry with the same key when saving fails", async () => {
    const sentKeys: (string | null)[] = [];
    server.use(
      http.post(recipesUrl, ({ request }) => {
        sentKeys.push(request.headers.get("Idempotency-Key"));

        return new HttpResponse(null, { status: 500 });
      }),
    );
    const { user } = renderWithProviders(<CreateRecipeForm />);

    await user.type(screen.getByLabelText("Titel"), "Lasagne");
    await fillIngredientAndStep(user);
    await user.click(screen.getByRole("button", { name: "Spara" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Något gick fel när receptet skulle skapas. Försök igen.",
    );
    expect(screen.getByLabelText("Titel")).toHaveValue("Lasagne");
    expect(screen.getByLabelText("Ingrediens")).toHaveValue("Pasta");
    expect(screen.getByLabelText("Steg 1")).toHaveValue("Koka pastan");

    const saveButton = screen.getByRole("button", { name: "Spara" });
    expect(saveButton).toBeEnabled();

    // The server has recovered, so the same input can be sent again.
    server.use(
      http.post(recipesUrl, ({ request }) => {
        sentKeys.push(request.headers.get("Idempotency-Key"));

        return HttpResponse.json(createdRecipe, { status: 201 });
      }),
    );
    await user.click(saveButton);

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    // The first attempt may have reached the server, so the retry must be recognised as the same attempt.
    expect(sentKeys).toHaveLength(2);
    expect(sentKeys[0]).toBeTruthy();
    expect(sentKeys[1]).toBe(sentKeys[0]);
  });

  it("navigates to the start page after a successful save and uses a new key the next time", async () => {
    const sentKeys: (string | null)[] = [];
    server.use(
      http.post(recipesUrl, ({ request }) => {
        sentKeys.push(request.headers.get("Idempotency-Key"));

        return HttpResponse.json(createdRecipe, { status: 201 });
      }),
    );

    // Each save happens in a newly opened form, as after navigating back to "Nytt recept".
    for (const title of ["Lasagne", "Pannkakor"]) {
      const { user, unmount } = renderWithProviders(<CreateRecipeForm />);
      await user.type(screen.getByLabelText("Titel"), title);
      await fillIngredientAndStep(user);
      await user.click(screen.getByRole("button", { name: "Spara" }));
      await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));
      unmount();
      routerReplace.mockClear();
    }

    expect(sentKeys).toHaveLength(2);
    expect(sentKeys[1]).not.toBe(sentKeys[0]);
  });

  it("explains a reused key and sends a new key on the next save", async () => {
    const sentKeys: (string | null)[] = [];
    server.use(
      http.post(recipesUrl, ({ request }) => {
        sentKeys.push(request.headers.get("Idempotency-Key"));

        return sentKeys.length === 1
          ? HttpResponse.json({ status: 422, title: "Idempotency key reused" }, { status: 422 })
          : HttpResponse.json(createdRecipe, { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<CreateRecipeForm />);

    await user.type(screen.getByLabelText("Titel"), "Lasagne");
    await fillIngredientAndStep(user);
    await user.click(screen.getByRole("button", { name: "Spara" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Ett tidigare försök kan redan ha sparat receptet.");
    expect(screen.getByLabelText("Titel")).toHaveValue("Lasagne");

    await user.click(screen.getByRole("button", { name: "Spara" }));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));
    expect(sentKeys).toHaveLength(2);
    expect(sentKeys[1]).not.toBe(sentKeys[0]);
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
    await user.click(screen.getByRole("button", { name: "Spara" }));

    // The navigation happens in onSuccess, so it means the whole flow has finished.
    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/"));

    expect(requestBody).toEqual({
      title: "Lasagne",
      description: null,
      instructions: "Koka pastan",
      ingredients: [{ name: "Pasta", amount: null, unit: null }],
    });
    expect(authorization).toBe("Bearer test-token");
  });

  it("lets the unit be typed in lower case on phones", async () => {
    renderWithProviders(<CreateRecipeForm />);

    const unitInput = await screen.findByLabelText("Enhet");
    expect(unitInput).toHaveAttribute("autocapitalize", "none");
    expect(unitInput).toHaveAttribute("autocorrect", "off");
    expect(unitInput).toHaveAttribute("spellcheck", "false");
  });
});
