// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listCvExports, upsertCvExport } from "./cv-export";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("upsertCvExport crée puis écrase le PDF d'une locale (unique par locale)", async () => {
  await upsertCvExport(prisma, { locale: "fr", url: "https://media/cv-fr.pdf", sizeBytes: 100 });
  await upsertCvExport(prisma, { locale: "fr", url: "https://media/cv-fr-v2.pdf", sizeBytes: 200 });

  const rows = await listCvExports(prisma);
  expect(rows).toHaveLength(1);
  expect(rows[0].url).toBe("https://media/cv-fr-v2.pdf");
  expect(rows[0].sizeBytes).toBe(200);
});

test("listCvExports retourne une ligne par locale, triée", async () => {
  await upsertCvExport(prisma, { locale: "en", url: "https://media/cv-en.pdf", sizeBytes: 1 });
  await upsertCvExport(prisma, { locale: "fr", url: "https://media/cv-fr.pdf", sizeBytes: 1 });
  const rows = await listCvExports(prisma);
  expect(rows.map((r) => r.locale)).toEqual(["en", "fr"]);
});
