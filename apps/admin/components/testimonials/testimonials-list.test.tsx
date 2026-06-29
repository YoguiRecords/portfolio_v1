import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { TestimonialsList, type TestimonialRow } from "./testimonials-list";

const items: TestimonialRow[] = [
  {
    id: "1",
    authorName: "Alice",
    authorRole: "CTO",
    authorCompany: "Acme",
    relationshipLabel: "Cliente",
    status: "PENDING",
    content: "Texte affiché",
    submittedContent: "Texte original",
    isFeatured: false,
  },
  {
    id: "2",
    authorName: "Bob",
    authorRole: null,
    authorCompany: null,
    relationshipLabel: null,
    status: "APPROVED",
    content: "Super",
    submittedContent: "Super",
    isFeatured: true,
  },
];

function makeActions() {
  return { approve: vi.fn(), reject: vi.fn(), edit: vi.fn(), feature: vi.fn() };
}

test("filtre par statut et affiche l'original (audit)", async () => {
  render(<TestimonialsList items={items} actions={makeActions()} />);
  expect(screen.getByText("Alice")).toBeInTheDocument();
  expect(screen.getByText(/Texte original/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Approuvés" }));
  expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  expect(screen.getByText("Bob")).toBeInTheDocument();
});

test("le refus demande confirmation", async () => {
  render(<TestimonialsList items={items} actions={makeActions()} />);
  await userEvent.click(screen.getAllByRole("button", { name: "Refuser ce témoignage" })[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Refuser" })).toBeInTheDocument();
});
