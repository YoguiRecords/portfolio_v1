import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "./db";
import { resetDb } from "./reset";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("une actu SCHEDULED n'est pas listée comme publiée", async () => {
  await prisma.article.create({
    data: {
      title: "x",
      slug: "x",
      excerpt: "e",
      content: "c",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 3_600_000),
    },
  });
  const published = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
  });
  expect(published).toHaveLength(0);
});

test("un évènement public PUBLISHED est requêtable", async () => {
  await prisma.event.create({
    data: {
      title: "e",
      slug: "e",
      startAt: new Date(),
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
  });
  const list = await prisma.event.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC" },
  });
  expect(list).toHaveLength(1);
});
