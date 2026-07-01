import { expect, test } from "vitest";
import { isHoneypotHit, readJsonBody } from "./public-request";

test("readJsonBody: renvoie l'objet pour un JSON valide", async () => {
  // Arrange
  const request = new Request("http://x", { method: "POST", body: JSON.stringify({ a: 1 }) });

  // Act
  const body = await readJsonBody(request);

  // Assert
  expect(body).toEqual({ a: 1 });
});

test("readJsonBody: renvoie null pour un JSON invalide", async () => {
  // Arrange
  const request = new Request("http://x", { method: "POST", body: "{oops" });

  // Act
  const body = await readJsonBody(request);

  // Assert
  expect(body).toBeNull();
});

test("isHoneypotHit: vrai quand le champ leurre est rempli", () => {
  expect(isHoneypotHit({ website: "http://spam" })).toBe(true);
});

test("isHoneypotHit: faux quand le champ est vide, absent ou le body non-objet", () => {
  expect(isHoneypotHit({ website: "" })).toBe(false);
  expect(isHoneypotHit({ name: "ok" })).toBe(false);
  expect(isHoneypotHit(null)).toBe(false);
  expect(isHoneypotHit("string")).toBe(false);
});
