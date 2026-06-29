import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Profil } from "./profil";
import type { HomeData } from "../../lib/data/home";

const section = {
  id: "s1",
  key: "profil",
  eyebrow: "Chapitre 01",
  title: "Le profil",
  intro: "intro",
} as unknown as HomeData["sections"][number];

test("Profil rend une puce SWOT depuis un Analysis", () => {
  const analyses = [
    {
      id: "a1",
      type: "SWOT",
      title: "Mon profil",
      items: [{ id: "i1", groupLabel: "Forces", text: "Vision + exécution", verdict: null }],
    },
  ] as unknown as HomeData["analyses"];

  render(<Profil section={section} kpis={[]} analyses={analyses} />);
  expect(screen.getByText("Vision + exécution")).toBeInTheDocument();
  expect(screen.getByText("Forces")).toBeInTheDocument();
});
