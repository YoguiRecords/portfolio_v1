import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TestimonialForm } from "./testimonial-form";

test("affiche les champs (prénom, nom, entreprise, relation) et le honeypot caché", () => {
  render(<TestimonialForm />);
  expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
  expect(screen.getByLabelText("Nom")).toBeInTheDocument();
  expect(screen.getByLabelText("Entreprise (optionnel)")).toBeInTheDocument();
  expect(screen.getByLabelText("Votre lien avec Yohan (optionnel)")).toBeInTheDocument();
  expect(screen.getByLabelText("Votre témoignage")).toBeInTheDocument();
  // Le honeypot est présent mais masqué (aria-hidden).
  const honeypot = screen.getByLabelText("Ne pas remplir");
  expect(honeypot).toHaveAttribute("tabindex", "-1");
});
