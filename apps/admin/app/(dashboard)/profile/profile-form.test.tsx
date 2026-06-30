import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { ProfileForm, type ProfileFormValues } from "./profile-form";
import { upsertProfileAction } from "@/lib/actions/content-actions";

vi.mock("@/lib/actions/content-actions", () => ({
  upsertProfileAction: vi.fn(),
}));

const values: ProfileFormValues = {
  fullName: "Yohan Debusscher",
  headline: "Concepteur",
  email: "y@example.com",
  bio: "Bio",
  typewriterLines: ["J'innove."],
  sigText: "vision",
  location: "Lille",
  currentRole: "Fondateur",
  availabilityLabel: "Disponible",
  isAvailable: true,
  aiSummary: "Résumé",
  cvAccroche: "",
  cvAvailabilityStart: "",
  cvMobility: "",
  cvContractType: "",
};

beforeEach(() => {
  vi.mocked(upsertProfileAction).mockReset();
});

test("affiche un message de succès après un enregistrement réussi", async () => {
  // Arrange
  vi.mocked(upsertProfileAction).mockResolvedValue({ ok: true });
  const user = userEvent.setup();
  render(<ProfileForm profile={values} />);

  // Act
  await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

  // Assert
  expect(await screen.findByRole("status")).toHaveTextContent("Profil enregistré.");
});

test("affiche un message d'erreur quand l'enregistrement échoue", async () => {
  // Arrange
  vi.mocked(upsertProfileAction).mockResolvedValue({ error: "Échec de l'enregistrement. Vérifiez les champs." });
  const user = userEvent.setup();
  render(<ProfileForm profile={values} />);

  // Act
  await user.click(screen.getByRole("button", { name: /Enregistrer/i }));

  // Assert
  expect(await screen.findByRole("alert")).toHaveTextContent("Échec de l'enregistrement");
});
