import { expect, test } from "@playwright/test";

test("la home FR montre le titre français, /en montre l'overlay anglais", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Le profil, en clair." })).toBeVisible();

  await page.goto("/en");
  await expect(page.getByRole("heading", { name: "The profile, in clear." })).toBeVisible();
});

test("le sélecteur de langue bascule FR → EN", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Switch to English/i }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading", { name: "The profile, in clear." })).toBeVisible();
});
