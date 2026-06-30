import { describe, expect, test } from "vitest";
import { computeLayout, goalToView, type GoalLike } from "./cap-geometry";

describe("goalToView", () => {
  test("mappe chaque statut vers son libellé et son kind", () => {
    expect(goalToView("ACHIEVED")).toEqual({ kind: "done", label: "Acquis" });
    expect(goalToView("IN_PROGRESS")).toEqual({ kind: "now", label: "En cours" });
    expect(goalToView("TARGET")).toEqual({ kind: "next", label: "Cible" });
    expect(goalToView("HORIZON")).toEqual({ kind: "far", label: "Horizon" });
  });
});

describe("computeLayout", () => {
  const goals: GoalLike[] = [
    { id: "a", role: "Développeur", status: "ACHIEVED" },
    { id: "b", role: "Ingénieur", status: "ACHIEVED" },
    { id: "c", role: "Indépendant", status: "IN_PROGRESS" },
    { id: "d", role: "CTO", status: "TARGET" },
  ];

  test("place un point par objectif et dérive le nœud en cours", () => {
    const l = computeLayout(goals, "horizontal");
    expect(l.nodes).toHaveLength(4);
    expect(l.nowIndex).toBe(2); // le IN_PROGRESS
    expect(l.nodes[3].isDest).toBe(true); // dernier = étoile-cap
    expect(l.nodes[0].view.kind).toBe("done");
    expect(l.nodes[2].view.kind).toBe("now");
  });

  test("sans IN_PROGRESS, la frontière est le dernier ACHIEVED", () => {
    const l = computeLayout(
      [
        { id: "a", role: "Dev", status: "ACHIEVED" },
        { id: "b", role: "CTO", status: "TARGET" },
      ],
      "vertical",
    );
    expect(l.nowIndex).toBe(0);
  });

  test("délais strictement croissants (stagger du reveal)", () => {
    const d = computeLayout(goals, "horizontal").nodes.map((n) => n.delay);
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });

  test("gère 0 et 1 objectif sans planter", () => {
    expect(computeLayout([], "horizontal").nodes).toHaveLength(0);
    expect(computeLayout([goals[0]], "vertical").solidPath).toBeTypeOf("string");
  });
});
