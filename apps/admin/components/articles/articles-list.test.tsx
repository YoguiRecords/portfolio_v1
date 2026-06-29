import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/articles" }));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi as vitest } from "vitest";
import { ArticlesList, type ArticleRow } from "./articles-list";

const articles: ArticleRow[] = [
  { id: "1", title: "Sortie du jeu", slug: "sortie-jeu", status: "PUBLISHED", scheduledAtLabel: null, tagCount: 2 },
  { id: "2", title: "Conférence", slug: "conf", status: "SCHEDULED", scheduledAtLabel: "01/07/2026 18:00", tagCount: 0 },
];

function makeActions() {
  return { create: vitest.fn(), remove: vitest.fn() };
}

test("filtre les articles par statut", async () => {
  render(<ArticlesList articles={articles} actions={makeActions()} />);
  expect(screen.getByText("Sortie du jeu")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Programmés" }));
  expect(screen.queryByText("Sortie du jeu")).not.toBeInTheDocument();
  expect(screen.getByText("Conférence")).toBeInTheDocument();
});

test("la suppression demande confirmation", async () => {
  render(<ArticlesList articles={articles} actions={makeActions()} />);
  await userEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Supprimer définitivement" })).toBeInTheDocument();
});
