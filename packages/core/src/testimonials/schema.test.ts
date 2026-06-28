import { expect, test } from "vitest";
import { TestimonialInput } from "./schema";

test("accepte une soumission valide", () => {
  const r = TestimonialInput.safeParse({
    authorName: "Une cliente",
    content: "Un retour vraiment positif et détaillé.",
  });
  expect(r.success).toBe(true);
});

test("rejette un contenu vide ou trop court", () => {
  expect(TestimonialInput.safeParse({ authorName: "X", content: "" }).success).toBe(false);
});

test("ignore tout champ status fourni (pas d'auto-validation)", () => {
  const r = TestimonialInput.safeParse({
    authorName: "X",
    content: "Contenu suffisamment long pour passer.",
    status: "APPROVED",
  });
  expect(r.success).toBe(true);
  expect(r.success && "status" in r.data).toBe(false);
});
