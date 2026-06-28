import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TestimonialForm } from "./testimonial-form";

test("affiche les champs requis et le honeypot caché", () => {
  render(<TestimonialForm />);
  expect(screen.getByLabelText("Votre nom")).toBeInTheDocument();
  expect(screen.getByLabelText("Votre témoignage")).toBeInTheDocument();
  // Le honeypot est présent mais masqué (aria-hidden).
  const honeypot = screen.getByLabelText("Ne pas remplir");
  expect(honeypot).toHaveAttribute("tabindex", "-1");
});
