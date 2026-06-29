import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("affiche la page courante", () => {
    render(<Pagination page={2} pageCount={5} />);
    expect(screen.getByText("Page 2 / 5")).toBeInTheDocument();
  });

  it("incrémente via le bouton suivant", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Page suivante" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("désactive le bouton précédent en page 1", () => {
    render(<Pagination page={1} pageCount={5} />);
    expect(screen.getByRole("button", { name: "Page précédente" })).toBeDisabled();
  });
});
