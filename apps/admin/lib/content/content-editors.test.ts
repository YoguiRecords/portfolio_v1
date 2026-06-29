// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createSkill, deleteSkill, listSkills } from "./skill";
import { createFaq, listFaqs } from "./faq";
import { upsertSettings, getSettings } from "./site-settings";
import { createTrack, createMilestone, listTracks, createGoal, listGoals } from "./career";
import { createAnalysis, createAnalysisItem, listAnalyses } from "./analysis";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("Skill: create puis delete (validé Zod)", async () => {
  const skill = await createSkill(prisma, { name: "Full-stack", order: 0 });
  expect(await listSkills(prisma)).toHaveLength(1);
  await deleteSkill(prisma, skill.id);
  expect(await listSkills(prisma)).toHaveLength(0);
});

test("Skill: rejette un nom vide", async () => {
  await expect(createSkill(prisma, { name: "", order: 0 })).rejects.toThrow();
});

test("FAQ: create avec scope par défaut GLOBAL", async () => {
  await createFaq(prisma, { question: "Q ?", answer: "Réponse." });
  const [faq] = await listFaqs(prisma);
  expect(faq.scope).toBe("GLOBAL");
});

test("SiteSettings: upsert est idempotent (singleton)", async () => {
  await upsertSettings(prisma, { brandName: "A" });
  await upsertSettings(prisma, { brandName: "B" });
  const all = await prisma.siteSettings.findMany();
  expect(all).toHaveLength(1);
  expect((await getSettings(prisma))?.brandName).toBe("B");
});

test("Career: une voie avec son jalon + un objectif", async () => {
  const track = await createTrack(prisma, { name: "Dev", slug: "dev", colorHex: "#f0a800", order: 0 });
  await createMilestone(prisma, { trackId: track.id, dateLabel: "2024", sortYear: 2024, role: "Lead", order: 0 });
  await createGoal(prisma, { role: "CTO", status: "TARGET", order: 0 });

  const [t] = await listTracks(prisma);
  expect(t.milestones).toHaveLength(1);
  expect(await listGoals(prisma)).toHaveLength(1);
});

test("Career: rejette une couleur hex invalide", async () => {
  await expect(createTrack(prisma, { name: "X", slug: "x", colorHex: "rouge", order: 0 })).rejects.toThrow();
});

test("Analysis: un bloc SWOT avec son item", async () => {
  const analysis = await createAnalysis(prisma, { type: "SWOT", title: "Profil", order: 0 });
  await createAnalysisItem(prisma, { analysisId: analysis.id, groupLabel: "Forces", text: "Polyvalence", order: 0 });

  const [a] = await listAnalyses(prisma);
  expect(a.type).toBe("SWOT");
  expect(a.items).toHaveLength(1);
});
