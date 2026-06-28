import { defineConfig } from "vitest/config";

/**
 * Shared Vitest configuration for the monorepo (node environment).
 *
 * Re-exported (merged) by package-level configs so unit/integration tests
 * share the same defaults. UI packages layer a jsdom variant on top
 * (see `vitest.web.ts`).
 */
export const sharedTest = defineConfig({
  test: {
    environment: "node",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/e2e/**"],
  },
});
