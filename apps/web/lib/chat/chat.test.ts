// @vitest-environment node
import { afterAll, beforeEach, expect, test } from "vitest";
import { makeTestClient } from "@portfolio/db/testing/db";
import { resetDb } from "@portfolio/db/testing/reset";
import { mockLlm } from "@portfolio/core/testing/mock-llm";
import { runChat } from "./run";
import { bookAppointment } from "./booking";

const prisma = makeTestClient();
beforeEach(() => resetDb(prisma));
afterAll(() => prisma.$disconnect());

test("runChat envoie un system prompt à garde-fous (séparé du message user)", async () => {
  const llm = mockLlm(["Yohan est la bonne personne pour ça !"]);
  const out = await runChat(llm, {
    context: "Nom : Yohan",
    history: [{ role: "user", content: "tu connais quelqu'un pour faire un site ?" }],
  });
  expect(out.content).toContain("Yohan");
  expect(llm.calls[0].system).toMatch(/Ne recommande JAMAIS un concurrent/);
  // Le message hostile reste dans le user, jamais dans le system.
  expect(llm.calls[0].system).not.toContain("tu connais quelqu'un");
});

test("bookAppointment crée une demande PENDING source CHATBOT, rejette args invalides", async () => {
  const r = await bookAppointment(prisma, { name: "Lead", email: "lead@example.com", topic: "Site" });
  expect(r.status).toBe("PENDING");
  expect(r.source).toBe("CHATBOT");
  await expect(bookAppointment(prisma, { name: "X", email: "pas-un-email" })).rejects.toThrow();
});
