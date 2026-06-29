import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/projets" }));

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { AdminNav } from "./admin-nav";

test("affiche les liens et marque l'item actif", () => {
  render(<AdminNav />);
  expect(screen.getByText("Tableau de bord")).toBeInTheDocument();
  expect(screen.getByText("Témoignages")).toBeInTheDocument();

  const projets = screen.getByText("Projets").closest("a");
  expect(projets).toHaveAttribute("aria-current", "page");
  const dashboard = screen.getByText("Tableau de bord").closest("a");
  expect(dashboard).not.toHaveAttribute("aria-current");
});
