import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ContactForm } from "./contact-form";

test("affiche les champs requis et le honeypot caché", () => {
  render(<ContactForm />);
  expect(screen.getByLabelText("Votre nom")).toBeInTheDocument();
  expect(screen.getByLabelText("Votre email")).toBeInTheDocument();
  expect(screen.getByLabelText("Votre message")).toBeInTheDocument();
  const honeypot = screen.getByLabelText("Ne pas remplir");
  expect(honeypot).toHaveAttribute("tabindex", "-1");
});
