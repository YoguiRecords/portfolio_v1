import { render, screen } from "@testing-library/react";
import { SaveBar } from "./save-bar";

describe("SaveBar", () => {
  it("affiche le statut et les actions", () => {
    render(
      <SaveBar status="Enregistré">
        <button type="button">Enregistrer</button>
      </SaveBar>,
    );
    expect(screen.getByText("Enregistré")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enregistrer" })).toBeInTheDocument();
  });
});
