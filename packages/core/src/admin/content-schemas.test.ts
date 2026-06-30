import { expect, test } from "vitest";
import {
  CareerGoalUpdate,
  EducationInput,
  ExperienceInput,
  InterestInput,
  KpiInput,
  LanguageInput,
  ProfileInput,
  ProjectInput,
  SkillInput,
  HomeSectionInput,
} from "./content-schemas";

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

test("ExperienceInput applique les défauts de surface et coerce les dates", () => {
  const r = ExperienceInput.safeParse({
    title: "Lead",
    company: "Acme",
    startDate: "2023-01-01",
  });
  expect(r.success).toBe(true);
  if (r.success) {
    expect(r.data.tier).toBe("MINI");
    expect(r.data.badge).toBe("NONE");
    expect(r.data.showOnCvPage).toBe(true);
    expect(r.data.showOnPdf).toBe(false);
    expect(r.data.startDate).toBeInstanceOf(Date);
  }
});

test("ExperienceInput rejette un title vide et un tier inconnu", () => {
  expect(ExperienceInput.safeParse({ title: "", company: "A", startDate: "2023-01-01" }).success).toBe(false);
  expect(
    ExperienceInput.safeParse({ title: "x", company: "A", startDate: "2023-01-01", tier: "NOPE" }).success,
  ).toBe(false);
});

test("EducationInput exige titre + date, défauts surface", () => {
  const r = EducationInput.safeParse({ title: "Master", date: "2018 — 2020" });
  expect(r.success && r.data.showOnPdf).toBe(true);
  expect(EducationInput.safeParse({ title: "Master" }).success).toBe(false); // date manquante
});

test("LanguageInput + InterestInput exigent leurs champs", () => {
  expect(LanguageInput.safeParse({ name: "Français", level: "Maternelle" }).success).toBe(true);
  expect(LanguageInput.safeParse({ name: "Français" }).success).toBe(false);
  expect(InterestInput.safeParse({ label: "Course" }).success).toBe(true);
  expect(InterestInput.safeParse({ label: "" }).success).toBe(false);
});

test("SkillInput porte kind/showOnCv, ProjectInput porte cvBadge, KpiInput showOnCv", () => {
  const s = SkillInput.safeParse({ name: "Leadership", kind: "SOFT", showOnCv: true });
  expect(s.success && s.data.kind).toBe("SOFT");
  expect(SkillInput.safeParse({ name: "x", kind: "NOPE" }).success).toBe(false);
  const p = ProjectInput.safeParse({
    title: "P",
    slug: "p",
    summary: "s",
    content: "c",
    cvBadge: "KEY",
    showOnCv: true,
  });
  expect(p.success && p.data.cvBadge).toBe("KEY");
  const k = KpiInput.safeParse({ label: "X", value: "1", showOnCv: true });
  expect(k.success && k.data.showOnCv).toBe(true);
});
