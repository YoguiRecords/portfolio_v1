import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/projets" }));

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AdminNav } from "./admin-nav";

test("affiche les groupes, marque l'item actif et rend les compteurs", () => {
  render(<AdminNav badges={{ pendingTestimonials: 3 }} />);

  // Libellés de groupe
  expect(screen.getByText("Contenu")).toBeInTheDocument();
  expect(screen.getByText("Relation client")).toBeInTheDocument();
  expect(screen.getByText("Mesure")).toBeInTheDocument();

  // Item actif (route /projets)
  const projets = screen.getByText("Projets").closest("a");
  expect(projets).toHaveAttribute("aria-current", "page");
  const dashboard = screen.getByText("Tableau de bord").closest("a");
  expect(dashboard).not.toHaveAttribute("aria-current");

  // Compteur témoignages
  expect(screen.getByText("3")).toBeInTheDocument();
});
