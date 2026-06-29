import { render, screen } from "@testing-library/react";
import { Status } from "./status";

describe("Status", () => {
  it("rend le libellé et la classe du variant publié", () => {
    render(<Status variant="published">Publié</Status>);
    const el = screen.getByText("Publié");
    expect(el).toHaveAttribute("data-variant", "published");
  });
});
