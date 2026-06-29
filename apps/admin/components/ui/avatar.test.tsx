import { render, screen } from "@testing-library/react";
import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("affiche les initiales en l'absence d'image", () => {
    render(<Avatar name="Yohan Debusscher" />);
    expect(screen.getByText("YD")).toBeInTheDocument();
  });

  it("affiche l'image quand src est fourni", () => {
    render(<Avatar name="Yohan" src="https://example.test/a.webp" />);
    expect(screen.getByRole("img", { name: "Yohan" })).toBeInTheDocument();
  });
});
