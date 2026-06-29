import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ContentToTreatPanel } from "./content-to-treat-panel";

test("rend les lignes à traiter avec leurs compteurs et liens", () => {
  render(
    <ContentToTreatPanel
      data={{ draftProjects: 1, draftArticles: 2, scheduledArticles: 0, pendingTestimonials: 3 }}
    />,
  );
  expect(screen.getByText("Projets en brouillon")).toBeInTheDocument();
  expect(screen.getByText("Témoignages à valider").closest("a")).toHaveAttribute("href", "/temoignages");
  expect(screen.getByText("3")).toBeInTheDocument();
});
