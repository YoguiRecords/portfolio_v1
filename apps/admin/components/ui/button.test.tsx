import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("déclenche onClick et applique le variant primary", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        OK
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("respecte l'état disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Non
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Non" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
