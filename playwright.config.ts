import { defineConfig } from "@playwright/test";

/**
 * Playwright E2E config. Boots the public `web` app on its dev port and runs
 * specs from `./e2e`. Reuses an already-running server locally; CI starts a
 * fresh one.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry" },
  webServer: {
    command: "pnpm --filter web dev",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
