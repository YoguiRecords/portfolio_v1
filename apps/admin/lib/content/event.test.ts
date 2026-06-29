// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { createEvent, generateNewsFromEvent } from "./event";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

const base = { title: "Meetup", slug: "meetup", startAt: "2026-09-15T18:30:00Z" };

test("createEvent persiste, SCHEDULED sans date rejeté", async () => {
  const e = await createEvent(prisma, base);
  expect(e.slug).toBe("meetup");
  await expect(createEvent(prisma, { ...base, slug: "m2", status: "SCHEDULED" })).rejects.toThrow();
});

test("generateNewsFromEvent crée une actu DRAFT liée à l'évènement", async () => {
  const e = await createEvent(prisma, { ...base, description: "Une belle rencontre." });
  const article = await generateNewsFromEvent(prisma, e.id);
  expect(article.status).toBe("DRAFT");
  expect(article.eventId).toBe(e.id);
  expect(article.title).toContain("Meetup");
});
