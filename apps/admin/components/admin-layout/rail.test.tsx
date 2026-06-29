import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/projets" }));

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Rail } from "./rail";

test("marque l'item actif, expose les tooltips et les compteurs", () => {
  render(<Rail badges={{ pendingTestimonials: 2 }} />);

  // Tooltip / nom accessible via aria-label
  const projets = screen.getByRole("link", { name: "Projets" });
  expect(projets).toHaveAttribute("aria-current", "page");
  expect(projets).toHaveAttribute("title", "Projets");

  // Item non actif
  expect(screen.getByRole("link", { name: "Articles" })).not.toHaveAttribute("aria-current");

  // Compteur témoignages
  expect(screen.getByText("2")).toBeInTheDocument();
});
