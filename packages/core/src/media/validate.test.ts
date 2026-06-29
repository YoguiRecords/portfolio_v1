import { expect, test } from "vitest";
import { validateUpload } from "./validate";

test("accepte une image jpeg dans les limites", () => {
  expect(validateUpload({ mimeType: "image/jpeg", sizeBytes: 1000, width: 800, height: 600 }))
    .toEqual({ ok: true });
});

test("rejette un mime non autorisé", () => {
  expect(validateUpload({ mimeType: "application/pdf", sizeBytes: 1000 })).toEqual({
    ok: false,
    error: "mime_not_allowed",
  });
});

test("rejette une taille hors limite", () => {
  expect(validateUpload({ mimeType: "image/png", sizeBytes: 6 * 1024 * 1024 }).ok).toBe(false);
});

test("rejette des dimensions excessives", () => {
  expect(validateUpload({ mimeType: "image/png", sizeBytes: 1000, width: 9000 }).ok).toBe(false);
});
