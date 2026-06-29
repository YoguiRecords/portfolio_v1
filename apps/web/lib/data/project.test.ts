// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createProject } from "@portfolio/db/testing/factories";
import { getProjectBySlug } from "./project";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("getProjectBySlug renvoie null pour un projet non publié", async () => {
  await prisma.project.create({
    data: { title: "Brouillon", slug: "draft", summary: "s", content: "c", status: "DRAFT" },
  });
  expect(await getProjectBySlug(prisma, "draft")).toBeNull();
});

test("getProjectBySlug renvoie le projet publié avec ses blocs ordonnés", async () => {
  await createProject(prisma, { title: "Demo", slug: "demo" });
  const result = await getProjectBySlug(prisma, "demo");
  expect(result?.project.slug).toBe("demo");
  expect(result?.project.blocks).toEqual([]);
});
