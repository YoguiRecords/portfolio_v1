import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TopContentPanel } from "./top-content-panel";

test("rend les contenus avec leur type", () => {
  render(
    <TopContentPanel
      items={[{ id: "a1", title: "Mon article", kind: "article", publishedAt: new Date("2026-06-01") }]}
    />,
  );
  expect(screen.getByText("Mon article")).toBeInTheDocument();
  expect(screen.getByText("Article")).toBeInTheDocument();
});

test("affiche l'état vide sans contenu", () => {
  render(<TopContentPanel items={[]} />);
  expect(screen.getByText("Aucun contenu publié")).toBeInTheDocument();
});
