import { render, screen } from "@testing-library/react";
import { Toolbar } from "./toolbar";

describe("Toolbar", () => {
  it("expose le rôle toolbar et rend ses enfants", () => {
    render(
      <Toolbar>
        <button type="button">Créer</button>
      </Toolbar>,
    );
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Créer" })).toBeInTheDocument();
  });
});
