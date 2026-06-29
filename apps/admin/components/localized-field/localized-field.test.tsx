import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { LocalizedField } from "./localized-field";

test("l'EN est masqué par défaut et s'affiche après clic sur le bouton EN", async () => {
  const user = userEvent.setup();
  render(
    <LocalizedField label="Titre" frValue="Le profil" onChangeFr={() => {}} onSaveEn={() => {}} />,
  );

  expect(screen.queryByLabelText("Version anglaise")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /EN/i }));
  expect(screen.getByLabelText("Version anglaise")).toBeInTheDocument();
});

test("« Sauvegarder l'EN » n'apparaît qu'en mode EN et déclenche la sauvegarde", async () => {
  const user = userEvent.setup();
  const onSaveEn = vi.fn();
  render(
    <LocalizedField
      label="Titre"
      frValue="Le profil"
      enValue="The profile"
      onChangeFr={() => {}}
      onSaveEn={onSaveEn}
    />,
  );

  expect(screen.queryByRole("button", { name: /Sauvegarder l'EN/i })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /🇬🇧 EN/i }));
  await user.click(screen.getByRole("button", { name: /Sauvegarder l'EN/i }));
  expect(onSaveEn).toHaveBeenCalledWith("The profile");
});
