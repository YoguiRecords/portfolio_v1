import { render, screen } from "@testing-library/react";
import { Select } from "./select";

describe("Select", () => {
  it("rend les options enfants", () => {
    render(
      <Select aria-label="Statut">
        <option value="draft">Brouillon</option>
      </Select>,
    );
    expect(screen.getByRole("option", { name: "Brouillon" })).toBeInTheDocument();
  });
});
