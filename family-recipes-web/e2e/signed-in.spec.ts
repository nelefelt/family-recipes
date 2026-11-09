import { expect, test } from "@playwright/test";

// The first name comes from the API, which read it from the test headers and stored it in the database.
test("shows the signed-in user on the start page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: /, Anna$/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Senast tillagda" })).toBeVisible();
});
