import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { getTrafficSummary } from "./traffic";

const NOW = 1_700_000_000_000;

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("renvoie un résumé non configuré quand l'env Umami est absent", async () => {
  vi.stubEnv("UMAMI_API_URL", "");
  vi.stubEnv("UMAMI_API_TOKEN", "");
  vi.stubEnv("UMAMI_WEBSITE_ID", "");

  const summary = await getTrafficSummary(NOW);

  expect(summary.configured).toBe(false);
  expect(summary.visitors).toBeNull();
});

test("parse les visiteurs et calcule la variation quand Umami est configuré", async () => {
  vi.stubEnv("UMAMI_API_URL", "https://stats.test");
  vi.stubEnv("UMAMI_API_TOKEN", "token");
  vi.stubEnv("UMAMI_WEBSITE_ID", "site-1");
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ visitors: { value: 100, prev: 50 }, pageviews: { value: 300 } }),
  });
  vi.stubGlobal("fetch", fetchMock);

  const summary = await getTrafficSummary(NOW);

  expect(summary).toEqual({ configured: true, visitors: 100, pageviews: 300, deltaPct: 100 });
  expect(fetchMock).toHaveBeenCalledOnce();
});

test("retombe en non configuré si l'API échoue", async () => {
  vi.stubEnv("UMAMI_API_URL", "https://stats.test");
  vi.stubEnv("UMAMI_API_TOKEN", "token");
  vi.stubEnv("UMAMI_WEBSITE_ID", "site-1");
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

  const summary = await getTrafficSummary(NOW);

  expect(summary.configured).toBe(false);
});
