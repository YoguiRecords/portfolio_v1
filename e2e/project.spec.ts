import { expect, test } from "@playwright/test";

test("cliquer un projet de la home ouvre sa fiche", async ({ page }) => {
  await page.goto("/");
  // Le lien de la scène projet (pas celui de l'orbite, qui pointe sur #work).
  await page.locator('a[href="/projets/domestic-revolt"]').first().click();
  await expect(page).toHaveURL(/\/projets\/domestic-revolt/);
  await expect(
    page.getByRole("heading", { name: /Domestic Revolt/i, level: 1 }),
  ).toBeVisible();
  // Un bloc de l'étude de cas est rendu (CONTEXT du seed).
  await expect(page.getByText("Contexte").first()).toBeVisible();
});

test("un slug inconnu renvoie un 404", async ({ page }) => {
  const res = await page.goto("/projets/inexistant");
  expect(res?.status()).toBe(404);
});
