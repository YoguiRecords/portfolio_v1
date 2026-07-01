// @vitest-environment node
import { expect, test } from "vitest";
import { mockLlm } from "@portfolio/core/testing/mock-llm";
import { runChat } from "./run";

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

test("le system prompt interdit d'inventer des créneaux et renvoie vers le bouton RDV", async () => {
  const llm = mockLlm(["Je vous propose de prendre rendez-vous."]);
  await runChat(llm, {
    context: "Nom : Yohan",
    history: [{ role: "user", content: "je veux un rendez-vous" }],
  });
  expect(llm.calls[0].system).toMatch(/N'invente JAMAIS de créneaux/);
  expect(llm.calls[0].system).toMatch(/Prendre RDV/);
});
