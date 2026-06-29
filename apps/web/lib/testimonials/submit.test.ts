// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { persistTestimonial } from "./submit";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("persistTestimonial crée un témoignage PENDING (jamais auto-validé)", async () => {
  await persistTestimonial(
    prisma,
    { authorName: "Cliente", content: "Un retour détaillé et positif." },
    { ip: "1.2.3.4", userAgent: "test" },
  );

  const rows = await prisma.testimonial.findMany();
  expect(rows).toHaveLength(1);
  expect(rows[0].status).toBe("PENDING");
  expect(rows[0].submittedContent).toBe("Un retour détaillé et positif.");
  expect(rows[0].content).toBe("Un retour détaillé et positif.");
});

test("persistTestimonial enregistre entreprise et relation hiérarchique", async () => {
  await persistTestimonial(
    prisma,
    {
      authorName: "Jean Dupont",
      authorRole: "CTO",
      authorCompany: "Acme",
      authorRelationship: "MANAGER",
      content: "Un manager exigeant et inspirant au quotidien.",
    },
    { ip: null, userAgent: null },
  );

  const row = await prisma.testimonial.findFirstOrThrow();
  expect(row.authorCompany).toBe("Acme");
  expect(row.authorRelationship).toBe("MANAGER");
});
