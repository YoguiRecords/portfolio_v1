import { expect, test } from "@playwright/test";

test("l'agenda affiche un évènement et son détail montre le bouton d'inscription", async ({
  page,
}) => {
  await page.goto("/agenda");
  await expect(page.getByRole("heading", { name: /Meetup Dev & Produit/i })).toBeVisible();

  await page.locator('a[href="/agenda/meetup-dev-produit"]').first().click();
  await expect(page).toHaveURL(/\/agenda\/meetup-dev-produit/);

  const register = page.getByRole("link", { name: /S'inscrire/i });
  await expect(register).toBeVisible();
  await expect(register).toHaveAttribute("rel", /noopener/);
});
