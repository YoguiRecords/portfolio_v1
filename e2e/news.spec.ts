import { expect, test } from "@playwright/test";

test("la liste des actus affiche une actu publiée et ouvre son détail", async ({ page }) => {
  await page.goto("/actus");
  await expect(
    page.getByRole("heading", { name: /Construire un produit de bout en bout/i }),
  ).toBeVisible();

  await page.locator('a[href="/actus/build-solo"]').first().click();
  await expect(page).toHaveURL(/\/actus\/build-solo/);
  // Le markdown est rendu (titre de niveau 2 du contenu).
  await expect(page.getByRole("heading", { name: "Le constat" })).toBeVisible();
});
