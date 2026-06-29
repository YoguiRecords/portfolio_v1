import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Markdown } from "./markdown";

test("rend titres, gras et liens sûrs", () => {
  render(<Markdown content={"## Titre\n\nUn **mot** fort et [lien](https://ex.test)."} />);
  expect(screen.getByRole("heading", { name: "Titre" })).toBeInTheDocument();
  expect(screen.getByText("mot").tagName).toBe("STRONG");
  expect(screen.getByRole("link", { name: "lien" })).toHaveAttribute("href", "https://ex.test");
});

test("neutralise un lien javascript: (rendu en texte)", () => {
  render(<Markdown content={"[texte](javascript:alert(1))"} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  expect(screen.getByText(/texte/)).toBeInTheDocument();
});
