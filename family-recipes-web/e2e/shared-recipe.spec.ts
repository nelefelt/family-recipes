import { expect, test } from "@playwright/test";
import type { components } from "../lib/api/generated/schema";
import { e2eApiUrl, testUsers } from "./support/test-users";

type CreateRecipeRequest = components["schemas"]["CreateRecipeRequest"];
type RecipeResponse = components["schemas"]["RecipeResponse"];

test("lets another user read a recipe but not manage it", async ({ page, browser, playwright, baseURL }) => {
  const title = `E2E-delat recept ${Date.now()}`;

  // Arrange through the API: the form is already covered by create-recipe.spec.ts.
  const annaApi = await playwright.request.newContext({ baseURL: e2eApiUrl, extraHTTPHeaders: testUsers.anna });
  const body: CreateRecipeRequest = {
    title,
    description: null,
    instructions: "Koka pastan",
    ingredients: [{ name: "Pasta", amount: 250, unit: "g" }],
  };
  const response = await annaApi.post("/api/recipes", { data: body });
  expect(response.ok()).toBe(true);
  const recipe = (await response.json()) as RecipeResponse;
  await annaApi.dispose();

  // A new context is a separate browser session. It does not get the config's use options, so set them here.
  const bertilContext = await browser.newContext({ baseURL, extraHTTPHeaders: testUsers.bertil });
  const bertilPage = await bertilContext.newPage();

  await bertilPage.goto(`/recipes/${recipe.id}`);
  await expect(bertilPage.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(bertilPage.getByRole("button", { name: "Hantera recept" })).toBeHidden();
  await bertilContext.close();

  // Counter-check: the owner sees the menu. Without this, the hidden check above would also pass
  // if the menu were renamed or removed.
  await page.goto(`/recipes/${recipe.id}`);
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hantera recept" })).toBeVisible();
});
