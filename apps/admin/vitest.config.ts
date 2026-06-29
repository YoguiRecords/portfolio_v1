import { fileURLToPath } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import { sharedTest } from "../../vitest.shared";

/**
 * Admin tests: jsdom for React component behavior (RTL); DB-backed tests opt
 * into the node environment per-file. The DB tests share one Postgres schema, so
 * everything runs in a single fork, serialized, to avoid cross-file races.
 */
export default mergeConfig(
  sharedTest,
  defineConfig({
    // Mirror the app's `@/*` path alias so tests resolve source imports.
    resolve: {
      alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["../../vitest.setup.ts"],
      fileParallelism: false,
      pool: "forks",
      maxWorkers: 1,
      minWorkers: 1,
    },
  }),
);
