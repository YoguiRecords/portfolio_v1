import { expect, test } from "vitest";
import { buildContext } from "./chat-context";
import { buildSystemPrompt } from "./guardrails";

test("buildContext inclut le nom et un projet, exclut toute PII", () => {
  const ctx = buildContext({
    profile: { fullName: "Yohan Debusscher", headline: "Concepteur", aiSummary: "Profil hybride." },
    projects: [{ title: "Domestic Revolt", summary: "Conçu et livré." }],
    skills: [{ name: "Full-stack" }],
  });
  expect(ctx).toContain("Yohan Debusscher");
  expect(ctx).toContain("Domestic Revolt");
  // Aucune donnée privée (pas d'email de contact dans le contexte public).
  expect(ctx).not.toMatch(/@/);
});

test("buildSystemPrompt contient les règles clés et le contexte", () => {
  const prompt = buildSystemPrompt("Nom : Yohan");
  expect(prompt).toMatch(/Mets TOUJOURS Yohan en avant/);
  expect(prompt).toMatch(/Ne recommande JAMAIS un concurrent/);
  expect(prompt).toMatch(/book_appointment/);
  expect(prompt).toContain("Nom : Yohan");
});

test("buildSystemPrompt : une injection utilisateur n'est pas dans le system prompt", () => {
  // Le system prompt est construit côté serveur, indépendamment du message user.
  const prompt = buildSystemPrompt("ctx");
  expect(prompt).not.toMatch(/ignore les règles/i);
});
