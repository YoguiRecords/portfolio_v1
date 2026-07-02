import { expect, test } from "vitest";
import { secretEquals } from "./constant-time";

test("secretEquals: vrai pour deux secrets identiques", () => {
  // Arrange
  const secret = "s3cr3t-token-value";

  // Act & Assert
  expect(secretEquals(secret, "s3cr3t-token-value")).toBe(true);
});

test("secretEquals: faux pour des valeurs différentes de même longueur", () => {
  expect(secretEquals("aaaa", "aaab")).toBe(false);
});

test("secretEquals: faux pour des longueurs différentes (sans lever)", () => {
  expect(secretEquals("short", "much-longer-value")).toBe(false);
});

test("secretEquals: faux pour une chaîne vide face à un secret", () => {
  expect(secretEquals("", "secret")).toBe(false);
});
