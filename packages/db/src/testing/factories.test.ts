import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "./db";
import { resetDb } from "./reset";
import { createProfile, createProject } from "./factories";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("createProject persists a published project with defaults", async () => {
  await createProfile(prisma);
  const p = await createProject(prisma, { title: "Demo", slug: "demo" });
  expect(p.status).toBe("PUBLISHED");
  expect(p.slug).toBe("demo");
});
