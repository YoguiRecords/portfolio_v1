import { expect, test } from "@playwright/test";

const ADMIN = "http://localhost:3101";

/**
 * Sécurité : toutes les nouvelles routes BO v2 (inbox, CRM, mission control, CV)
 * sont protégées — un accès sans session authentifiée redirige vers /login.
 */
const GUARDED_ROUTES = ["/inbox", "/contacts", "/societes", "/pipeline", "/mission-control", "/cv"];

for (const path of GUARDED_ROUTES) {
  test(`accès ${path} sans session → redirige vers /login`, async ({ page }) => {
    await page.goto(`${ADMIN}${path}`);
    await expect(page).toHaveURL(/\/login/);
  });
}
