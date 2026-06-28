import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SiteNav } from "./site-nav";

test("la nav affiche les libellés des sections visibles", () => {
  render(
    <SiteNav
      brand="Yohan."
      links={[
        { href: "#about", label: "Profil" },
        { href: "#goals", label: "Cap" },
      ]}
    />,
  );
  expect(screen.getAllByText("Profil").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Cap").length).toBeGreaterThan(0);
});
