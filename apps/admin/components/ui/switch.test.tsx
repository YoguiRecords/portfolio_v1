import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";

describe("Switch", () => {
  it("reflète l'état coché via aria-checked", () => {
    render(<Switch checked label="Visible" />);
    expect(screen.getByRole("switch", { name: "Visible" })).toHaveAttribute("aria-checked", "true");
  });

  it("appelle onCheckedChange avec la valeur inversée au clic", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} label="Visible" />);
    await userEvent.click(screen.getByRole("switch", { name: "Visible" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
