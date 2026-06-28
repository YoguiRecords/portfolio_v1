import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { BlockRenderer } from "./block-renderer";

test("BlockRenderer rend les blocs valides et ignore les invalides", () => {
  render(
    <BlockRenderer
      images={[]}
      blocks={[
        {
          id: "b1",
          type: "CONTEXT",
          title: "Le contexte",
          data: { problem: "Un problème", objective: "Un objectif", role: "Lead" },
        },
        {
          id: "b2",
          type: "PROCESS",
          title: null,
          data: { phases: [{ label: "Cadrage", start: 0, width: 20 }] },
        },
        // Invalide (data manquante) → ignoré (fail-safe)
        { id: "b3", type: "RESULTS", title: null, data: { stats: [] } },
        // Type inconnu → ignoré
        { id: "b4", type: "WUT", title: null, data: {} },
      ]}
    />,
  );

  expect(screen.getByText("Un problème")).toBeInTheDocument();
  expect(screen.getByText("Cadrage")).toBeInTheDocument();
  expect(screen.getByText("Le contexte")).toBeInTheDocument();
  // Le bloc RESULTS invalide ne rend aucune stat
  expect(screen.queryByText(/livré/)).not.toBeInTheDocument();
});
