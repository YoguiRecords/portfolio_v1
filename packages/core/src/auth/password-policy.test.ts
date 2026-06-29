import { expect, test } from "vitest";
import { checkPasswordStrength } from "./password-policy";

test("rejette un mot de passe trop court", () => {
  expect(checkPasswordStrength("Ab1!xy").ok).toBe(false);
});

test("rejette un mot de passe courant", () => {
  expect(checkPasswordStrength("azertyuiop").ok).toBe(false);
});

test("rejette un mot de passe répétitif", () => {
  expect(checkPasswordStrength("aaaaaaaaaaaa").ok).toBe(false);
});

test("accepte un mot de passe fort", () => {
  expect(checkPasswordStrength("Tr0ub4dour&3x!").ok).toBe(true);
});

test("accepte une phrase de passe longue", () => {
  expect(checkPasswordStrength("cheval correct agrafe batterie").ok).toBe(true);
});
