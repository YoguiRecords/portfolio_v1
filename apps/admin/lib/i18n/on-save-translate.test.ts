// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { mockLlm } from "@portfolio/core/testing/mock-llm";
import { hashSource } from "@portfolio/core";
import { retranslateOnSave } from "./on-save-translate";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("FR modifié → EN réécrasé (même si édité main)", async () => {
  // EN existant, édité à la main, basé sur un ancien FR.
  await prisma.translation.create({
    data: {
      model: "Article",
      recordId: "a1",
      field: "title",
      locale: "en",
      value: "Old manual EN",
      isAuto: false,
      sourceHash: hashSource("Ancien titre FR"),
    },
  });

  const llm = mockLlm(["Fresh EN"]);
  const out = await retranslateOnSave(prisma, llm, "Article", "a1", { title: "Nouveau titre FR" });

  expect(out.translated).toBe(1);
  const tr = await prisma.translation.findFirst({
    where: { model: "Article", recordId: "a1", field: "title", locale: "en" },
  });
  expect(tr?.value).toBe("Fresh EN");
  expect(tr?.isAuto).toBe(true);
});

test("FR inchangé → aucun appel LLM, EN intact", async () => {
  const fr = "Titre stable";
  await prisma.translation.create({
    data: {
      model: "Article",
      recordId: "a2",
      field: "title",
      locale: "en",
      value: "Stable EN",
      isAuto: true,
      sourceHash: hashSource(fr),
    },
  });

  const llm = mockLlm(["should-not-be-used"]);
  const out = await retranslateOnSave(prisma, llm, "Article", "a2", { title: fr });

  expect(out.translated).toBe(0);
  expect(llm.calls).toHaveLength(0);
  const tr = await prisma.translation.findFirst({
    where: { model: "Article", recordId: "a2", field: "title", locale: "en" },
  });
  expect(tr?.value).toBe("Stable EN");
});
