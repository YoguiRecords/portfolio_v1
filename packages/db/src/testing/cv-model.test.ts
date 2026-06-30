import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "./db";
import { resetDb } from "./reset";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("crée et relit une Experience avec ses drapeaux par surface", async () => {
  // Arrange + Act
  const exp = await prisma.experience.create({
    data: {
      title: "Lead technique",
      company: "Acme",
      startDate: new Date("2023-01-01"),
      tier: "FEATURED",
      stack: ["TypeScript", "Next.js"],
      bullets: ["Livraison X", "Management Y"],
      showOnPdf: true,
    },
  });

  // Assert
  expect(exp.tier).toBe("FEATURED");
  expect(exp.showOnPdf).toBe(true);
  expect(exp.showOnCvPage).toBe(true); // défaut
  expect(exp.showOnSite).toBe(false); // défaut
  expect(exp.badge).toBe("NONE"); // défaut
  expect(exp.bullets).toEqual(["Livraison X", "Management Y"]);
});

test("CvExport est unique par locale (upsert)", async () => {
  // Arrange
  await prisma.cvExport.create({
    data: { locale: "fr", url: "https://media/cv-fr.pdf", sizeBytes: 100 },
  });

  // Act — upsert même locale
  const updated = await prisma.cvExport.upsert({
    where: { locale: "fr" },
    create: { locale: "fr", url: "https://media/other.pdf", sizeBytes: 200 },
    update: { url: "https://media/cv-fr-v2.pdf", sizeBytes: 200 },
  });

  // Assert
  expect(updated.url).toBe("https://media/cv-fr-v2.pdf");
  expect(await prisma.cvExport.count()).toBe(1);
});

test("Skill porte kind/showOnCv et Project porte showOnCv/cvBadge", async () => {
  // Arrange + Act
  const soft = await prisma.skill.create({
    data: { name: "Communication", kind: "SOFT", showOnCv: true },
  });
  const project = await prisma.project.create({
    data: {
      title: "Domestic Revolt",
      slug: "domestic-revolt-cv-test",
      summary: "s",
      content: "c",
      showOnCv: true,
      cvBadge: "KEY",
    },
  });

  // Assert
  expect(soft.kind).toBe("SOFT");
  expect(soft.showOnCv).toBe(true);
  expect(project.cvBadge).toBe("KEY");
  expect(project.showOnCv).toBe(true);
});
