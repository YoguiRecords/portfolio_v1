import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Segmented } from "./segmented";

const options = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillons" },
] as const;

describe("Segmented", () => {
  it("marque l'option active avec aria-pressed", () => {
    render(<Segmented options={[...options]} value="all" />);
    expect(screen.getByRole("button", { name: "Tous" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Brouillons" })).toHaveAttribute("aria-pressed", "false");
  });

  it("appelle onChange avec la valeur cliquée", async () => {
    const onChange = vi.fn();
    render(<Segmented options={[...options]} value="all" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Brouillons" }));
    expect(onChange).toHaveBeenCalledWith("draft");
  });
});
