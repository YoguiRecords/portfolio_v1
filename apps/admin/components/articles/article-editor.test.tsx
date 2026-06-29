import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { ArticleEditor, type ArticleEditorData } from "./article-editor";

const base: ArticleEditorData = {
  id: "1",
  title: "Actu initiale",
  slug: "actu-initiale",
  excerpt: "",
  content: "Corps initial.",
  tags: "",
  status: "DRAFT",
  scheduledAt: "",
  seoTitle: "",
  seoDescription: "",
};

test("l'aperçu live reflète la saisie du titre", async () => {
  render(<ArticleEditor article={base} action={vi.fn()} />);
  const preview = screen.getByRole("complementary");
  expect(preview).toHaveTextContent("Actu initiale");

  const title = screen.getByLabelText("Titre");
  await userEvent.clear(title);
  await userEvent.type(title, "Titre modifié");
  expect(preview).toHaveTextContent("Titre modifié");
});

test("affiche l'indication de date quand le statut est Programmée", async () => {
  render(<ArticleEditor article={{ ...base, status: "SCHEDULED" }} action={vi.fn()} />);
  expect(screen.getByText("Requise pour une actu programmée")).toBeInTheDocument();
});
