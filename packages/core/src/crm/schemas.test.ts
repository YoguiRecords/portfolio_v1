import { expect, test } from "vitest";
import { CrmContactInput, DealInput, CompanyInput } from "./schemas";

test("CrmContactInput : statut par défaut LEAD sur un contact minimal", () => {
  const result = CrmContactInput.parse({ firstName: "Alice" });
  expect(result.status).toBe("LEAD");
});

test("CrmContactInput : rejette un email invalide", () => {
  expect(CrmContactInput.safeParse({ firstName: "Alice", email: "pas-un-email" }).success).toBe(false);
});

test("DealInput : rejette un stage inconnu", () => {
  expect(DealInput.safeParse({ title: "Vente", contactId: "c1", stage: "FOO" }).success).toBe(false);
});

test("DealInput : accepte un stage valide", () => {
  expect(DealInput.safeParse({ title: "Vente", contactId: "c1", stage: "WON" }).success).toBe(true);
});

test("CompanyInput : rejette une URL invalide", () => {
  expect(CompanyInput.safeParse({ name: "Acme", website: "notaurl" }).success).toBe(false);
});
