// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listSections, updateSection } from "./home-section";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("updateSection met à jour le texte et la visibilité (Zod)", async () => {
  const section = await prisma.homeSection.create({
    data: { key: "profil", title: "Ancien titre", isVisible: true, order: 1 },
  });

  await updateSection(prisma, section.id, {
    key: "profil",
    title: "Nouveau titre",
    intro: "Nouvelle intro",
    order: 1,
    isVisible: false,
  });

  const [updated] = await listSections(prisma);
  expect(updated.title).toBe("Nouveau titre");
  expect(updated.intro).toBe("Nouvelle intro");
  expect(updated.isVisible).toBe(false);
});

test("updateSection rejette une clé vide (Zod)", async () => {
  const section = await prisma.homeSection.create({ data: { key: "cap", order: 0 } });
  await expect(updateSection(prisma, section.id, { key: "", order: 0 })).rejects.toThrow();
});
