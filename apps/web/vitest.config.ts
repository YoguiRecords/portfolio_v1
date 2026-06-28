import { mergeConfig, defineConfig } from "vitest/config";
import { sharedTest } from "../../vitest.shared";

/**
 * Web app tests: jsdom for React component behavior (RTL) plus a few DB-backed
 * data-loader tests (those opt into the node environment per-file). The DB tests
 * share one Postgres schema, so file parallelism is disabled.
 */
export default mergeConfig(
  sharedTest,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["../../vitest.setup.ts"],
      // DB-backed tests share one Postgres schema → run every file in a single
      // fork, sequentially, to eliminate cross-file races on the shared schema.
      fileParallelism: false,
      pool: "forks",
      poolOptions: { forks: { singleFork: true } },
    },
  }),
);
