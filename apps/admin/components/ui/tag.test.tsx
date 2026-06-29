import { render, screen } from "@testing-library/react";
import { Tag } from "./tag";

describe("Tag", () => {
  it("rend son contenu", () => {
    render(<Tag>TypeScript</Tag>);
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
