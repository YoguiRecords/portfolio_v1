// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listEvents } from "./agenda";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("listEvents ne renvoie que les évènements publics publiés", async () => {
  await prisma.event.create({
    data: { title: "Public", slug: "pub", startAt: new Date(), status: "PUBLISHED", visibility: "PUBLIC" },
  });
  await prisma.event.create({
    data: { title: "Privé", slug: "priv", startAt: new Date(), status: "PUBLISHED", visibility: "PRIVATE" },
  });
  await prisma.event.create({
    data: { title: "Brouillon", slug: "draft", startAt: new Date(), status: "DRAFT", visibility: "PUBLIC" },
  });
  const list = await listEvents(prisma);
  expect(list.map((e) => e.slug)).toEqual(["pub"]);
});
