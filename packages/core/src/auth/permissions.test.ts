import { expect, test } from "vitest";
import { can, effectivePermissions, presetFor, isReadOnly, BO_MODULES } from "./permissions";

test("OWNER a accès à tous les modules (bypass)", () => {
  const owner = { role: "OWNER" as const, permissions: [] };
  expect(can(owner, "users")).toBe(true);
  expect(can(owner, "settings")).toBe(true);
  expect(effectivePermissions(owner).size).toBe(BO_MODULES.length);
});

test("SECRETARY (préréglage) accède à inbox mais pas à settings/users", () => {
  const secretary = { role: "SECRETARY" as const, permissions: presetFor("SECRETARY") };
  expect(can(secretary, "inbox")).toBe(true);
  expect(can(secretary, "settings")).toBe(false);
  expect(can(secretary, "users")).toBe(false);
});

test("un override manuel ajoute un module au-delà du préréglage", () => {
  const editor = { role: "EDITOR" as const, permissions: [...presetFor("EDITOR"), "settings"] };
  expect(can(editor, "settings")).toBe(true);
});

test("VIEWER est en lecture seule", () => {
  expect(isReadOnly({ role: "VIEWER" })).toBe(true);
  expect(isReadOnly({ role: "EDITOR" })).toBe(false);
});
