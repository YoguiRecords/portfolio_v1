import { expect, test } from "@playwright/test";

test("la home affiche le nom et au moins un projet", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // "Domestic Revolt" (issu du seed) apparaît dans l'orbite et la scène projet :
  // on cible explicitement le titre de la scène (heading de niveau 3).
  await expect(
    page.getByRole("heading", { name: "Domestic Revolt", level: 3 }),
  ).toBeVisible();
});
