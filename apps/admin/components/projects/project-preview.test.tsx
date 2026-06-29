import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ProjectPreview } from "./project-preview";

test("rend la catégorie, le titre et le résumé depuis les données", () => {
  render(
    <ProjectPreview data={{ title: "Mon jeu", type: "GAME", summary: "Un résumé", tagline: "Accroche", role: "Lead" }} />,
  );
  expect(screen.getByRole("heading", { name: "Mon jeu" })).toBeInTheDocument();
  expect(screen.getByText(/Jeu/)).toBeInTheDocument();
  expect(screen.getByText("Un résumé")).toBeInTheDocument();
});

test("affiche un titre de repli quand vide", () => {
  render(<ProjectPreview data={{ title: "", type: "SOFTWARE" }} />);
  expect(screen.getByRole("heading", { name: "Titre du projet" })).toBeInTheDocument();
});
