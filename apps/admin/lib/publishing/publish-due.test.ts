// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { publishDue } from "./publish-due";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("publishDue publie les contenus échus et laisse les futurs programmés", async () => {
  const now = new Date("2026-07-01T12:00:00Z");
  await prisma.article.create({
    data: {
      title: "Échue",
      slug: "echue",
      excerpt: "e",
      content: "c",
      status: "SCHEDULED",
      scheduledAt: new Date("2026-07-01T10:00:00Z"),
    },
  });
  await prisma.article.create({
    data: {
      title: "Future",
      slug: "future",
      excerpt: "e",
      content: "c",
      status: "SCHEDULED",
      scheduledAt: new Date("2026-07-02T10:00:00Z"),
    },
  });

  const result = await publishDue(prisma, now);

  expect(result.articles).toBe(1);
  const echue = await prisma.article.findUnique({ where: { slug: "echue" } });
  const future = await prisma.article.findUnique({ where: { slug: "future" } });
  expect(echue?.status).toBe("PUBLISHED");
  expect(echue?.publishedAt).toEqual(now);
  expect(future?.status).toBe("SCHEDULED");
});
