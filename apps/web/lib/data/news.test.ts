// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listArticles, getArticleBySlug } from "./news";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("listArticles exclut les actus programmées (SCHEDULED)", async () => {
  await prisma.article.create({
    data: { title: "Publiée", slug: "pub", excerpt: "e", content: "c", status: "PUBLISHED", publishedAt: new Date() },
  });
  await prisma.article.create({
    data: {
      title: "Programmée",
      slug: "sched",
      excerpt: "e",
      content: "c",
      status: "SCHEDULED",
      scheduledAt: new Date(Date.now() + 3_600_000),
    },
  });
  const list = await listArticles(prisma);
  expect(list.map((a) => a.slug)).toEqual(["pub"]);
});

test("getArticleBySlug renvoie null pour une actu non publiée", async () => {
  await prisma.article.create({
    data: { title: "D", slug: "d", excerpt: "e", content: "c", status: "DRAFT" },
  });
  expect(await getArticleBySlug(prisma, "d")).toBeNull();
});
