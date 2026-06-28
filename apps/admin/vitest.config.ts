import { mergeConfig, defineConfig } from "vitest/config";
import { sharedTest } from "../../vitest.shared";

/**
 * Admin tests run in node. Some hit the isolated Postgres `test` schema (shared
 * across files), so file parallelism is disabled to avoid cross-file races.
 */
export default mergeConfig(
  sharedTest,
  defineConfig({
    test: { fileParallelism: false },
  }),
);
