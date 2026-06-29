import { expect, test } from "@playwright/test";

test("la home expose title, meta description et un JSON-LD Person", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
  const desc = page.locator('meta[name="description"]');
  await expect(desc).toHaveAttribute("content", /.+/);

  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain('"Person"');
});

test("/sitemap.xml et /llms.txt répondent", async ({ page }) => {
  const sitemap = await page.goto("/sitemap.xml");
  expect(sitemap?.status()).toBe(200);

  const llms = await page.goto("/llms.txt");
  expect(llms?.status()).toBe(200);
  expect(llms?.headers()["content-type"]).toContain("text/plain");
});
