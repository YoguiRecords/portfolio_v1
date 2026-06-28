import { mergeConfig, defineConfig } from "vitest/config";
import { sharedTest } from "../../vitest.shared";

/**
 * DB package tests share a single isolated Postgres schema (`test`) and reset it
 * between tests. Running test files in parallel would let one file's TRUNCATE
 * race another file's inserts, so file parallelism is disabled here.
 */
export default mergeConfig(
  sharedTest,
  defineConfig({
    test: { fileParallelism: false },
  }),
);
