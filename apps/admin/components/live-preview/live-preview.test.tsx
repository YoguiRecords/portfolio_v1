import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LivePreview } from "./live-preview";

test("fermé : affiche le bouton de réouverture et déclenche onToggle", async () => {
  const onToggle = vi.fn();
  render(
    <LivePreview open={false} onToggle={onToggle}>
      contenu
    </LivePreview>,
  );
  expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /Afficher l’aperçu/ }));
  expect(onToggle).toHaveBeenCalledOnce();
});

test("ouvert : affiche l'aperçu et le ferme via ✕", async () => {
  const onToggle = vi.fn();
  render(
    <LivePreview open onToggle={onToggle}>
      contenu
    </LivePreview>,
  );
  expect(screen.getByRole("complementary")).toBeInTheDocument();
  expect(screen.getByText("contenu")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /Fermer l’aperçu/ }));
  expect(onToggle).toHaveBeenCalledOnce();
});
