import { expect, test } from "@playwright/test";

const ADMIN = "http://localhost:3101";

test("accès direct au BO sans session → redirige vers /login", async ({ page }) => {
  await page.goto(`${ADMIN}/`);
  await expect(page).toHaveURL(/\/login/);
});

test("la page de login du BO s'affiche", async ({ page }) => {
  await page.goto(`${ADMIN}/login`);
  await expect(page.getByRole("button", { name: /connexion|se connecter|connecter/i })).toBeVisible();
});
