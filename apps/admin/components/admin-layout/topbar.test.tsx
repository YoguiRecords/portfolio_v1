import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Topbar } from "./topbar";

test("rend la recherche, les notifications et le bouton Créer", () => {
  render(<Topbar adminEmail="yohan@example.test" />);
  expect(screen.getByRole("button", { name: "Rechercher" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Créer/ })).toBeInTheDocument();
});
