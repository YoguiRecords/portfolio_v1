import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("forward les props natives (placeholder)", () => {
    render(<Input placeholder="Rechercher" />);
    expect(screen.getByPlaceholderText("Rechercher")).toBeInTheDocument();
  });
});
