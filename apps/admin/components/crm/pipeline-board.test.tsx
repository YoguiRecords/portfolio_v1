import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { PipelineBoard, columnTotal, type DealCardRow } from "./pipeline-board";

const deals: DealCardRow[] = [
  { id: "1", title: "Site vitrine", contactName: "Alice", valueCents: 500000, stage: "PROSPECT" },
  { id: "2", title: "Refonte", contactName: "Bob", valueCents: 300000, stage: "WON" },
];

test("columnTotal additionne les valeurs", () => {
  expect(columnTotal(deals)).toBe(800000);
});

test("affiche les cartes dans la bonne colonne avec un sélecteur de stage", () => {
  render(
    <PipelineBoard deals={deals} contacts={[{ id: "c1", name: "Alice" }]} actions={{ setStage: vi.fn(), create: vi.fn() }} />,
  );
  expect(screen.getByText("Site vitrine")).toBeInTheDocument();
  // Sélecteur de déplacement présent pour chaque carte
  expect(screen.getByLabelText("Déplacer Site vitrine")).toBeInTheDocument();
  expect(screen.getByLabelText("Déplacer Refonte")).toBeInTheDocument();
});
