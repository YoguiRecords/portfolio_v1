// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createProfile, createExperience } from "@portfolio/db/testing/factories";
import { getCvData } from "./cv";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("projette le corpus showOnCvPage/showOnCv et expose les PDFs par locale", async () => {
  // Arrange
  await createProfile(prisma);
  await createExperience(prisma, { title: "Sur /cv", showOnCvPage: true });
  await createExperience(prisma, { title: "Hors /cv", showOnCvPage: false });
  await prisma.skill.create({ data: { name: "TS", kind: "TECH", showOnCv: true } });
  await prisma.skill.create({ data: { name: "Lead", kind: "SOFT", showOnCv: true } });
  await prisma.skill.create({ data: { name: "Caché", kind: "TECH", showOnCv: false } });
  await prisma.cvExport.create({ data: { locale: "fr", url: "https://m/cv-fr.pdf", sizeBytes: 1 } });

  // Act
  const data = await getCvData(prisma, "fr");

  // Assert
  expect(data.experiences.map((e) => e.title)).toEqual(["Sur /cv"]);
  expect(data.skills.map((s) => s.name)).toEqual(["TS"]);
  expect(data.softSkills.map((s) => s.name)).toEqual(["Lead"]);
  expect(data.pdfs.fr).toBe("https://m/cv-fr.pdf");
});

test("applique l'overlay EN sur les expériences (fallback FR)", async () => {
  const exp = await createExperience(prisma, { title: "Lead", showOnCvPage: true });
  await prisma.translation.create({
    data: {
      model: "Experience",
      recordId: exp.id,
      field: "title",
      locale: "en",
      value: "Lead EN",
      isAuto: true,
      sourceHash: "h",
    },
  });

  const en = await getCvData(prisma, "en");
  expect(en.experiences[0].title).toBe("Lead EN");
});
