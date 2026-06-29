// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createKpi, updateKpi, deleteKpi, reorderKpis, listKpis } from "./kpi";
import { upsertProfile } from "./profile";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("createKpi valide et persiste, update modifie, delete retire", async () => {
  const kpi = await createKpi(prisma, { label: "Expérience", value: "4 ans" });
  expect(kpi.value).toBe("4 ans");

  await updateKpi(prisma, kpi.id, { label: "Expérience", value: "5 ans" });
  const after = await prisma.kpi.findUnique({ where: { id: kpi.id } });
  expect(after?.value).toBe("5 ans");

  await deleteKpi(prisma, kpi.id);
  expect(await prisma.kpi.count()).toBe(0);
});

test("createKpi rejette une entrée invalide (Zod)", async () => {
  await expect(createKpi(prisma, { label: "", value: "x" })).rejects.toThrow();
});

test("reorderKpis persiste le nouvel ordre", async () => {
  const a = await createKpi(prisma, { label: "A", value: "1", order: 0 });
  const b = await createKpi(prisma, { label: "B", value: "2", order: 1 });
  await reorderKpis(prisma, [
    { id: a.id, order: 1 },
    { id: b.id, order: 0 },
  ]);
  const ordered = await listKpis(prisma);
  expect(ordered.map((k) => k.label)).toEqual(["B", "A"]);
});

test("upsertProfile crée puis met à jour le singleton", async () => {
  const base = { fullName: "Yohan", headline: "h", bio: "b", email: "y@x.com" };
  await upsertProfile(prisma, base);
  await upsertProfile(prisma, { ...base, headline: "nouveau" });
  expect(await prisma.profile.count()).toBe(1);
  const p = await prisma.profile.findFirst();
  expect(p?.headline).toBe("nouveau");
});
