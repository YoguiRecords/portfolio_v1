// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createProfile, createExperience } from "@portfolio/db/testing/factories";
import { loadCvDocument } from "./cv-document";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("ne projette que les enregistrements marqués pour le PDF/CV", async () => {
  // Arrange
  await createProfile(prisma);
  await createExperience(prisma, { title: "Sur PDF", showOnPdf: true, tier: "FEATURED" });
  await createExperience(prisma, { title: "Hors PDF", showOnPdf: false });
  await prisma.skill.create({ data: { name: "TS", kind: "TECH", showOnCv: true, category: "Dev" } });
  await prisma.skill.create({ data: { name: "Leadership", kind: "SOFT", showOnCv: true } });
  await prisma.skill.create({ data: { name: "Caché", kind: "TECH", showOnCv: false } });

  // Act
  const data = await loadCvDocument(prisma, "fr");

  // Assert
  expect(data.experiences.map((e) => e.title)).toEqual(["Sur PDF"]);
  expect(data.skills.map((s) => s.name)).toEqual(["TS"]); // TECH + showOnCv
  expect(data.softSkills.map((s) => s.name)).toEqual(["Leadership"]); // SOFT + showOnCv
});

test("applique l'overlay EN sur les champs scalaires traduisibles", async () => {
  // Arrange
  const exp = await createExperience(prisma, { title: "Lead technique", showOnPdf: true });
  await prisma.translation.create({
    data: {
      model: "Experience",
      recordId: exp.id,
      field: "title",
      locale: "en",
      value: "Tech lead",
      sourceHash: "h",
    },
  });

  // Act
  const fr = await loadCvDocument(prisma, "fr");
  const en = await loadCvDocument(prisma, "en");

  // Assert
  expect(fr.experiences[0].title).toBe("Lead technique");
  expect(en.experiences[0].title).toBe("Tech lead");
});
