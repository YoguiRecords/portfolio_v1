import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("affiche le message et le CTA", () => {
    render(<EmptyState message="Aucun élément" action={<button type="button">Créer</button>} />);
    expect(screen.getByText("Aucun élément")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });
});
