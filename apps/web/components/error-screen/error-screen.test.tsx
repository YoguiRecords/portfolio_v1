import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ErrorScreen } from "./error-screen";

test("ErrorScreen: affiche le code, le message et le lien de retour", () => {
  // Arrange & Act
  render(<ErrorScreen code="404" title="Page introuvable." message="Rien ici." />);

  // Assert
  expect(screen.getByText("404")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Page introuvable." })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Retour à l’accueil/ })).toHaveAttribute("href", "/");
});

test("ErrorScreen: rend l'action optionnelle (bouton réessayer)", () => {
  // Arrange & Act
  render(
    <ErrorScreen code="500" title="Oups." message="…" action={<button type="button">Réessayer</button>} />,
  );

  // Assert
  expect(screen.getByRole("button", { name: "Réessayer" })).toBeInTheDocument();
});
