import { render, screen } from "@testing-library/react";
import { Field } from "./field";

describe("Field", () => {
  it("affiche le label et l'indication", () => {
    render(
      <Field label="Email" hint="Adresse professionnelle">
        <input />
      </Field>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Adresse professionnelle")).toBeInTheDocument();
  });

  it("affiche l'erreur à la place de l'indication", () => {
    render(
      <Field label="Email" hint="ignorée" error="Champ requis">
        <input />
      </Field>,
    );
    expect(screen.getByText("Champ requis")).toBeInTheDocument();
    expect(screen.queryByText("ignorée")).not.toBeInTheDocument();
  });
});
