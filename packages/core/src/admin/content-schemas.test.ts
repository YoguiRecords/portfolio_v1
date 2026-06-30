import { expect, test } from "vitest";
import { CareerGoalUpdate, KpiInput, ProfileInput, HomeSectionInput } from "./content-schemas";

test("KpiInput applique les défauts order/isVisible", () => {
  const r = KpiInput.safeParse({ label: "Expérience", value: "4 ans" });
  expect(r.success).toBe(true);
  expect(r.success && r.data.order).toBe(0);
  expect(r.success && r.data.isVisible).toBe(true);
});

test("KpiInput rejette un label vide", () => {
  expect(KpiInput.safeParse({ label: "", value: "x" }).success).toBe(false);
});

test("ProfileInput exige un email valide et borne typewriterLines", () => {
  expect(
    ProfileInput.safeParse({ fullName: "Y", headline: "h", bio: "b", email: "bad" }).success,
  ).toBe(false);
  const ok = ProfileInput.safeParse({
    fullName: "Y",
    headline: "h",
    bio: "b",
    email: "y@x.com",
    typewriterLines: ["a", "b"],
  });
  expect(ok.success).toBe(true);
});

test("HomeSectionInput exige une clé", () => {
  expect(HomeSectionInput.safeParse({ key: "" }).success).toBe(false);
  expect(HomeSectionInput.safeParse({ key: "hero" }).success).toBe(true);
});

test("CareerGoalUpdate exige un id et valide le statut", () => {
  expect(
    CareerGoalUpdate.safeParse({ id: "g1", role: "CTO", status: "TARGET", order: 2 }).success,
  ).toBe(true);
  expect(CareerGoalUpdate.safeParse({ role: "CTO", status: "TARGET" }).success).toBe(false); // id manquant
  expect(CareerGoalUpdate.safeParse({ id: "g1", role: "X", status: "NOPE" }).success).toBe(false);
});
