import { mergeConfig, defineConfig } from "vitest/config";
import { sharedTest } from "../../vitest.shared";

/** Shared UI package: jsdom for the React markdown renderer (RTL). */
export default mergeConfig(
  sharedTest,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["../../vitest.setup.ts"],
    },
  }),
);
