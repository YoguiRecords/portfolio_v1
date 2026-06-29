import { expect, test } from "vitest";
import { buildContext } from "./chat-context";

test("met en avant le prochain évènement, puis les autres dates", () => {
  const ctx = buildContext({
    events: [
      { title: "Conf A", startAt: new Date("2026-07-01T18:00:00.000Z") },
      { title: "Conf B", startAt: new Date("2026-08-01T10:00:00.000Z") },
    ],
  });
  expect(ctx).toContain("Prochain évènement : Conf A le 2026-07-01 18:00");
  expect(ctx).toContain("Autres dates à venir");
  expect(ctx).toContain("Conf B");
});

test("inclut le contenu public (projets, compétences) sans PII", () => {
  const ctx = buildContext({
    profile: { fullName: "Yohan", headline: "CTO" },
    projects: [{ title: "Domestic Revolt", summary: "Jeu" }],
    skills: [{ name: "TypeScript" }],
  });
  expect(ctx).toContain("Domestic Revolt");
  expect(ctx).toContain("TypeScript");
  expect(ctx).not.toContain("@");
});
