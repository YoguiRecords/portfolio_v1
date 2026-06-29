import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Markdown } from "./markdown";

test("rend le gras en <strong>", () => {
  render(<Markdown content="Un texte **important** ici." />);
  const strong = screen.getByText("important");
  expect(strong.tagName).toBe("STRONG");
});

test("neutralise le HTML injecté (pas d'exécution, rendu en texte)", () => {
  const { container } = render(<Markdown content={'Avant <script>alert(1)</script> après'} />);
  // Aucun élément <script> dans le DOM rendu.
  expect(container.querySelector("script")).toBeNull();
  // Le contenu brut apparaît comme texte.
  expect(container.textContent).toContain("<script>alert(1)</script>");
});

test("bloque les liens javascript: (rendu en texte simple)", () => {
  const { container } = render(<Markdown content="[clic](javascript:alert(1))" />);
  expect(screen.queryByRole("link")).toBeNull();
  expect(container.textContent).toContain("clic");
});

test("rend un lien http en <a rel=noopener>", () => {
  render(<Markdown content="[site](https://example.com)" />);
  const link = screen.getByRole("link", { name: "site" });
  expect(link).toHaveAttribute("href", "https://example.com");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
