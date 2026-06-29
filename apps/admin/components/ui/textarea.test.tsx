import { render, screen } from "@testing-library/react";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("forward les props natives (placeholder)", () => {
    render(<Textarea placeholder="Votre message" />);
    expect(screen.getByPlaceholderText("Votre message")).toBeInTheDocument();
  });
});
