// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { overlayMany, overlayOne } from "./overlay";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

async function seedProjectWithEn() {
  const project = await prisma.project.create({
    data: { title: "Titre FR", slug: "p", summary: "Résumé FR", content: "Contenu FR", type: "SOFTWARE", status: "PUBLISHED" },
  });
  await prisma.translation.create({
    data: { model: "Project", recordId: project.id, field: "title", locale: "en", value: "EN Title", isAuto: true, sourceHash: "h" },
  });
  return project;
}

test("overlayMany applique l'overlay EN et garde le FR en fallback", async () => {
  const project = await seedProjectWithEn();
  const [out] = await overlayMany(prisma, "en", "Project", [project], ["title", "summary"]);
  expect(out.title).toBe("EN Title"); // traduit
  expect(out.summary).toBe("Résumé FR"); // non traduit → fallback FR
});

test("overlayMany ne touche rien en FR", async () => {
  const project = await seedProjectWithEn();
  const [out] = await overlayMany(prisma, "fr", "Project", [project], ["title"]);
  expect(out.title).toBe("Titre FR");
});

test("overlayOne laisse passer null", async () => {
  expect(await overlayOne(prisma, "en", "Project", null, ["title"])).toBeNull();
});
