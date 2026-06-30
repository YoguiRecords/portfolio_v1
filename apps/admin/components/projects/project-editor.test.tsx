import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ProjectEditor, type ProjectEditorData } from "./project-editor";

const base: ProjectEditorData = {
  id: "1",
  title: "Projet initial",
  slug: "projet-initial",
  summary: "",
  tagline: "",
  role: "",
  type: "SOFTWARE",
  statusLabel: "",
  status: "DRAFT",
  featured: false,
  showOnCv: false,
  cvBadge: "NONE",
};

test("l'aperçu live reflète la saisie du titre", async () => {
  render(<ProjectEditor project={base} action={vi.fn()} />);
  const preview = screen.getByRole("complementary");
  // L'aperçu rend le titre initial
  expect(preview).toHaveTextContent("Projet initial");

  const title = screen.getByLabelText("Titre");
  await userEvent.clear(title);
  await userEvent.type(title, "Nouveau titre");
  expect(preview).toHaveTextContent("Nouveau titre");
});
