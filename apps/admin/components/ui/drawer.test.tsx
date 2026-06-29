import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "./drawer";

describe("Drawer", () => {
  it("ne rend rien quand fermé", () => {
    render(
      <Drawer open={false} onClose={() => {}}>
        Contenu
      </Drawer>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("rend le dialog ouvert et ferme via la touche Échap", async () => {
    const onClose = vi.fn();
    render(
      <Drawer open onClose={onClose} title="Détails">
        Contenu
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });
});
