// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createProject, updateProject } from "./project";
import { addBlock, updateBlock, reorderBlocks } from "./project-blocks";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

const base = { title: "Demo", slug: "demo", summary: "s", content: "c" };

test("createProject persiste, slug invalide rejeté, slug dupliqué rejeté", async () => {
  const p = await createProject(prisma, base);
  expect(p.slug).toBe("demo");
  await expect(createProject(prisma, { ...base, slug: "Bad Slug" })).rejects.toThrow();
  await expect(createProject(prisma, base)).rejects.toThrow(); // slug unique
});

test("updateProject publie le projet", async () => {
  const p = await createProject(prisma, base);
  const u = await updateProject(prisma, p.id, { ...base, status: "PUBLISHED" });
  expect(u.status).toBe("PUBLISHED");
});

test("addBlock + updateBlock valide les data selon le type, rejette l'invalide", async () => {
  const p = await createProject(prisma, base);
  const block = await addBlock(prisma, p.id, "PROCESS");
  await updateBlock(prisma, block.id, { phases: [{ label: "Cadrage", start: 0, width: 20 }] });
  const ok = await prisma.projectBlock.findUnique({ where: { id: block.id } });
  expect((ok?.data as { phases: unknown[] }).phases).toHaveLength(1);

  await expect(updateBlock(prisma, block.id, { phases: [{ label: "x", start: 0, width: 999 }] }))
    .rejects.toThrow();
});

test("reorderBlocks persiste l'ordre", async () => {
  const p = await createProject(prisma, base);
  const a = await addBlock(prisma, p.id, "TEXT");
  const b = await addBlock(prisma, p.id, "RESULTS");
  await reorderBlocks(prisma, [
    { id: a.id, order: 1 },
    { id: b.id, order: 0 },
  ]);
  const blocks = await prisma.projectBlock.findMany({ where: { projectId: p.id }, orderBy: { order: "asc" } });
  expect(blocks[0].id).toBe(b.id);
});
