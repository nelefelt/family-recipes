import { expect, test } from "@playwright/test";

test("sends a signed-out visitor to the login page", async ({ page }) => {
  // Runs before the app's own code, so the fake sign-in starts as signed out.
  await page.addInitScript(() => window.sessionStorage.setItem("e2e-signed-out", "true"));

  await page.goto("/");

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("heading", { name: "Familjens smaker, samlade." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Logga in" })).toBeEnabled();
});
