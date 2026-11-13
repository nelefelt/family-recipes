import { expect, test, type Page } from "@playwright/test";

const expectRecipeDetails = async (page: Page, title: string) => {
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await expect(page.getByText("Pasta", { exact: true })).toBeVisible();
  await expect(page.getByText("250 g", { exact: true })).toBeVisible();
  await expect(page.getByText("Koka pastan", { exact: true })).toBeVisible();
};

test("creates a recipe that is still there after a reload", async ({ page }) => {
  // Created inside the test, so other tests and retries never see the same title.
  const title = `E2E-lasagne ${Date.now()}`;

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Huvudnavigation" })
    .getByRole("link", { name: "Nytt recept" })
    .click();

  // exact: true, because "Ingrediens" would otherwise also match the "Ta bort ingrediens" button.
  await page.getByLabel("Titel", { exact: true }).fill(title);
  await page.getByLabel("Ingrediens", { exact: true }).fill("Pasta");
  await page.getByLabel("Mängd", { exact: true }).fill("250");
  await page.getByLabel("Enhet", { exact: true }).fill("g");
  await page.getByLabel("Steg 1", { exact: true }).fill("Koka pastan");
  await page.getByRole("button", { name: "Spara" }).click();

  // The toast is shown when the API has answered, so the recipe has been saved.
  await expect(page.getByText("Receptet har skapats")).toBeVisible();

  // After saving, the app goes back to the start page by itself.
  await expect(page).toHaveURL(/\/$/);

  // Checked before the click, so a missing recipe fails here with a clear message instead of a timeout.
  const recipeLink = page.getByRole("link", { name: title });
  await expect(recipeLink).toBeVisible();
  await recipeLink.click();
  await expectRecipeDetails(page, title);

  // A reload empties the React Query cache, so everything below comes from the API and the database.
  await page.reload();
  await expectRecipeDetails(page, title);
});
