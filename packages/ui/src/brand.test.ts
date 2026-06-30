import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { BRAND } from "./brand";

/**
 * Drift guard: the gold accent is declared as a literal in each app's
 * `globals.css` (a cross-package CSS `@import` proved unreliable under the
 * Turbopack dev resolver). This test makes `BRAND` the canonical source by
 * failing if either app's stylesheet no longer contains these exact values.
 */
const here = dirname(fileURLToPath(import.meta.url));
const GLOBALS = [
  resolve(here, "../../../apps/web/app/globals.css"),
  resolve(here, "../../../apps/admin/app/globals.css"),
];

describe("brand accent stays in sync across apps", () => {
  for (const file of GLOBALS) {
    test(`${file.replace(/\\/g, "/").split("/apps/")[1]} declares the canonical gold`, () => {
      const css = readFileSync(file, "utf8");
      expect(css).toContain(BRAND.accent);
      expect(css).toContain(BRAND.accentStrong);
    });
  }
});
