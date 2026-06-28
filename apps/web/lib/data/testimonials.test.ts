// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { listApprovedTestimonials } from "./testimonials";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("ne renvoie que les témoignages APPROVED, sans PII", async () => {
  await prisma.testimonial.create({
    data: {
      authorName: "Validée",
      authorEmail: "secret@example.com",
      content: "Affiché",
      submittedContent: "Original",
      status: "APPROVED",
    },
  });
  await prisma.testimonial.create({
    data: { authorName: "En attente", content: "Caché", submittedContent: "Caché", status: "PENDING" },
  });

  const list = await listApprovedTestimonials(prisma);
  expect(list).toHaveLength(1);
  expect(list[0].authorName).toBe("Validée");
  // Aucune colonne sensible exposée par le select.
  expect("authorEmail" in list[0]).toBe(false);
  expect("submittedContent" in list[0]).toBe(false);
  expect("ip" in list[0]).toBe(false);
});
