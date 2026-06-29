import { expect, test } from "@playwright/test";

test("envoyer le formulaire de contact affiche un message de succès", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#c-name").fill("Visiteur E2E");
  await page.locator("#c-email").fill("e2e@example.com");
  await page.locator("#c-message").fill("Un message de test automatisé, assez long.");
  await page.getByRole("button", { name: /^Envoyer/i }).click();
  await expect(page.getByText(/votre message a bien été envoyé/i)).toBeVisible();
});

test("demander un rendez-vous affiche un message de succès", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#a-name").fill("Visiteur RDV");
  await page.locator("#a-email").fill("rdv@example.com");
  await page.getByRole("button", { name: /Demander un rendez-vous/i }).click();
  await expect(page.getByText(/demande de rendez-vous a été transmise/i)).toBeVisible();
});
