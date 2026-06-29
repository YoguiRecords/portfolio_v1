import { expect, test } from "@playwright/test";

test("la home publique répond", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBeLessThan(400);
});
