import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ArticlePreview } from "./article-preview";

test("rend le titre, l'accroche et le contenu markdown", () => {
  render(
    <ArticlePreview data={{ title: "Mon actu", excerpt: "Accroche", content: "## Section\n\nCorps.", tags: ["news"] }} />,
  );
  expect(screen.getByRole("heading", { name: "Mon actu" })).toBeInTheDocument();
  expect(screen.getByText("Accroche")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Section" })).toBeInTheDocument();
  expect(screen.getByText("news")).toBeInTheDocument();
});
