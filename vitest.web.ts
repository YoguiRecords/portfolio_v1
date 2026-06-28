import { defineConfig, mergeConfig } from "vitest/config";
import { sharedTest } from "./vitest.shared";

/**
 * jsdom variant of the shared config for packages that render React
 * components (web/admin UI). Loads `@testing-library/jest-dom` matchers.
 */
export default mergeConfig(
  sharedTest,
  defineConfig({
    test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
  }),
);
