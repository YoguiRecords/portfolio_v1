import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { CapTrajectory } from "./cap-trajectory";
import type { GoalLike } from "../../lib/cap-geometry";

const goals: GoalLike[] = [
  { id: "a", role: "Développeur", status: "ACHIEVED" },
  { id: "b", role: "Indépendant · fondateur", status: "IN_PROGRESS" },
  { id: "c", role: "CTO", status: "TARGET" },
];

test("rend un item de liste par objectif, accessible, et marque l'en cours", () => {
  render(<CapTrajectory goals={goals} />);
  const list = screen.getAllByRole("list")[0]; // <ul> sémantique (desktop)
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  // labels présents
  expect(screen.getAllByText("Développeur").length).toBeGreaterThan(0);
  expect(screen.getAllByText("En cours").length).toBeGreaterThan(0);
});

test("est visible sans JS (pas d'état caché en SSR via aria)", () => {
  render(<CapTrajectory goals={goals} />);
  // le SVG décoratif est aria-hidden ; la liste textuelle reste lisible
  expect(screen.getAllByText("CTO").length).toBeGreaterThan(0);
});
