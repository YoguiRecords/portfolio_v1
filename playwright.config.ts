import { defineConfig } from "@playwright/test";

/**
 * Playwright E2E config. Boots the public `web` app on its dev port and runs
 * specs from `./e2e`. Reuses an already-running server locally; CI starts a
 * fresh one.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  // Generous assertion timeout so the dev server's first lazy compile of a route
  // doesn't flake the suite (notably in CI where the server starts cold).
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3100", trace: "on-first-retry" },
  webServer: [
    {
      command: "pnpm --filter web dev",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      // Thread the DB URL through to the dev server so the public pages can read
      // content (set by the shell locally, by the CI job env in CI).
      env: { DATABASE_URL: process.env.DATABASE_URL ?? "" },
    },
    {
      // Back office (port 3101) — used by the admin guard E2E.
      command: "pnpm --filter admin dev",
      url: "http://localhost:3101/login",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { DATABASE_URL: process.env.DATABASE_URL ?? "" },
    },
  ],
});
