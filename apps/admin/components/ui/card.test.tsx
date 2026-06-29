import { render, screen } from "@testing-library/react";
import { Panel } from "./card";

describe("Panel", () => {
  it("rend le titre et le contenu", () => {
    render(<Panel title="Projets">Contenu</Panel>);
    expect(screen.getByRole("heading", { name: "Projets" })).toBeInTheDocument();
    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });
});
