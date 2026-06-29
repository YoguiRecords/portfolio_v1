import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { MobileBar } from "./mobile-bar";

test("rend les entrées principales et marque l'accueil actif", () => {
  render(<MobileBar />);
  const accueil = screen.getByRole("link", { name: /Accueil/ });
  expect(accueil).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("link", { name: /Projets/ })).toBeInTheDocument();
});

test("le bouton Plus ouvre le tiroir de navigation complète", async () => {
  render(<MobileBar />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Plus" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  // La nav complète contient les libellés de groupe
  expect(screen.getByText("Relation client")).toBeInTheDocument();
});
