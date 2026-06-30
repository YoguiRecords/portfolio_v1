import { expect, test } from "vitest";
import {
  CrmContactInput,
  DealInput,
  CompanyInput,
  TaskInput,
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "./schemas";

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

test("TaskInput: valeurs par défaut (catégorie GENERAL, statut TODO, priorité NORMAL)", () => {
  const parsed = TaskInput.parse({ title: "Créer la facture" });
  expect(parsed).toMatchObject({ title: "Créer la facture", category: "GENERAL", status: "TODO", priority: "NORMAL" });
});

test("TaskInput: rejette un titre vide", () => {
  expect(() => TaskInput.parse({ title: "" })).toThrow();
});

test("TaskInput: rejette une catégorie inconnue", () => {
  expect(() => TaskInput.parse({ title: "X", category: "NOPE" })).toThrow();
});

test("constantes exposées (4 catégories, 4 statuts, 3 priorités)", () => {
  expect(TASK_CATEGORIES).toHaveLength(4);
  expect(TASK_STATUSES).toEqual(["TODO", "IN_PROGRESS", "BLOCKED", "DONE"]);
  expect(TASK_PRIORITIES).toEqual(["LOW", "NORMAL", "HIGH"]);
});
