import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/projets" }));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi as vitest } from "vitest";
import { ProjectsList, type ProjectRow } from "./projects-list";

const projects: ProjectRow[] = [
  { id: "1", title: "Domestic Revolt", slug: "domestic-revolt", type: "GAME", status: "PUBLISHED", featured: true },
  { id: "2", title: "Audit SI", slug: "audit-si", type: "BUSINESS", status: "DRAFT", featured: false },
];

function makeActions() {
  return { create: vitest.fn(), setStatus: vitest.fn(), remove: vitest.fn() };
}

test("rend les projets et filtre par recherche", async () => {
  render(<ProjectsList projects={projects} actions={makeActions()} />);
  expect(screen.getByText("Domestic Revolt")).toBeInTheDocument();
  expect(screen.getByText("Audit SI")).toBeInTheDocument();

  await userEvent.type(screen.getByPlaceholderText("Rechercher…"), "audit");
  expect(screen.queryByText("Domestic Revolt")).not.toBeInTheDocument();
  expect(screen.getByText("Audit SI")).toBeInTheDocument();
});

test("la suppression demande confirmation avant action", async () => {
  render(<ProjectsList projects={projects} actions={makeActions()} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
  const dialog = screen.getByRole("dialog");
  expect(dialog).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Supprimer définitivement" })).toBeInTheDocument();
});
