// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listFaq } from "./faq";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("listFaq ne renvoie que les entrées visibles du scope, ordonnées", async () => {
  await prisma.faqEntry.createMany({
    data: [
      { scope: "GLOBAL", order: 1, question: "Q2", answer: "A2", isVisible: true },
      { scope: "GLOBAL", order: 0, question: "Q1", answer: "A1", isVisible: true },
      { scope: "GLOBAL", order: 2, question: "Cachée", answer: "x", isVisible: false },
      { scope: "PROJECT", order: 0, question: "Autre scope", answer: "x", isVisible: true },
    ],
  });

  const list = await listFaq(prisma, "GLOBAL");
  expect(list.map((f) => f.question)).toEqual(["Q1", "Q2"]);
  // Seules les colonnes d'affichage sont exposées.
  expect("isVisible" in list[0]).toBe(false);
  expect("scope" in list[0]).toBe(false);
});
