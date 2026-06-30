// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  listExperiences,
  createEducation,
  createLanguage,
  createInterest,
  reorderInterests,
  listInterests,
} from "./cv-corpus";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("createExperience valide/persiste, update modifie, delete retire", async () => {
  const exp = await createExperience(prisma, {
    title: "Lead",
    company: "Acme",
    startDate: "2023-01-01",
    tier: "FEATURED",
    bullets: ["A", "B"],
    showOnPdf: true,
  });
  expect(exp.tier).toBe("FEATURED");
  expect(exp.showOnCvPage).toBe(true);

  await updateExperience(prisma, { id: exp.id, title: "Lead 2", company: "Acme", startDate: "2023-01-01" });
  const after = await prisma.experience.findUnique({ where: { id: exp.id } });
  expect(after?.title).toBe("Lead 2");

  await deleteExperience(prisma, exp.id);
  expect(await prisma.experience.count()).toBe(0);
});

test("createExperience rejette une entrée invalide (Zod)", async () => {
  await expect(
    createExperience(prisma, { title: "", company: "A", startDate: "2023-01-01" }),
  ).rejects.toThrow();
});

test("reorderExperiences applique order = index de la liste", async () => {
  const a = await createExperience(prisma, { title: "A", company: "C", startDate: "2023-01-01", order: 0 });
  const b = await createExperience(prisma, { title: "B", company: "C", startDate: "2023-01-01", order: 1 });
  await reorderExperiences(prisma, [b.id, a.id]);
  const ordered = await listExperiences(prisma);
  expect(ordered.map((e) => e.title)).toEqual(["B", "A"]);
});

test("education/language/interest CRUD de base + reorder interests", async () => {
  await createEducation(prisma, { title: "Master", date: "2018 — 2020" });
  await createLanguage(prisma, { name: "Français", level: "Maternelle" });
  const i1 = await createInterest(prisma, { label: "Course", order: 0 });
  const i2 = await createInterest(prisma, { label: "Jeux", order: 1 });
  expect(await prisma.education.count()).toBe(1);
  expect(await prisma.language.count()).toBe(1);

  await reorderInterests(prisma, [i2.id, i1.id]);
  const ordered = await listInterests(prisma);
  expect(ordered.map((i) => i.label)).toEqual(["Jeux", "Course"]);
});
