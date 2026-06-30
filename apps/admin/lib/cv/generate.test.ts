// @vitest-environment node
import { afterAll, beforeEach, expect, test, vi } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { generateCvExports } from "./generate";
import { listCvExports } from "@/lib/content/cv-export";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("génère FR + EN, stocke chaque PDF et upsert un CvExport par locale", async () => {
  // Arrange
  const generatePdf = vi.fn(async (locale: string) => Buffer.from(`pdf-${locale}`));
  const putObject = vi.fn(async (name: string) => `https://media/${name}`);
  const randomName = vi.fn(() => "rand");

  // Act
  await generateCvExports({ generatePdf, putObject, randomName, prisma });

  // Assert
  expect(generatePdf).toHaveBeenCalledTimes(2);
  expect(generatePdf).toHaveBeenCalledWith("fr");
  expect(generatePdf).toHaveBeenCalledWith("en");
  const exports = await listCvExports(prisma);
  expect(exports.map((e) => e.locale)).toEqual(["en", "fr"]); // sorted by locale
  expect(exports.find((e) => e.locale === "fr")?.url).toBe("https://media/rand-cv-fr.pdf");
  expect(exports.find((e) => e.locale === "fr")?.sizeBytes).toBe(Buffer.from("pdf-fr").length);
});

test("régénérer écrase les exports existants (upsert, pas de doublon)", async () => {
  const base = {
    generatePdf: async () => Buffer.from("x"),
    putObject: async (name: string) => `u/${name}`,
    prisma,
  };
  await generateCvExports({ ...base, randomName: () => "a" });
  await generateCvExports({ ...base, randomName: () => "b" });

  const exports = await listCvExports(prisma);
  expect(exports).toHaveLength(2); // fr + en, not 4
  expect(exports.every((e) => e.url.startsWith("u/b-cv-"))).toBe(true); // latest run won
});
