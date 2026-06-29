import { expect, test } from "@playwright/test";

test("affiche les témoignages approuvés, masque les PENDING", async ({ page }) => {
  await page.goto("/temoignages");
  // Approuvé (seed) visible.
  await expect(page.getByText(/Yohan a transformé notre idée/i)).toBeVisible();
  // En attente (seed PENDING) jamais affiché publiquement.
  await expect(page.getByText(/le tout en pilotant l'équipe/i)).toHaveCount(0);
});

test("soumettre le formulaire affiche le message d'attente de validation", async ({ page }) => {
  await page.goto("/temoignages");
  await page.getByLabel("Prénom").fill("Visiteur");
  await page.getByLabel("Nom").fill("E2E");
  await page.getByLabel("Votre témoignage").fill("Un retour de test automatisé, suffisamment long.");
  await page.getByRole("button", { name: /Envoyer/i }).click();
  await expect(page.getByText(/sera affiché après validation/i)).toBeVisible();
});
