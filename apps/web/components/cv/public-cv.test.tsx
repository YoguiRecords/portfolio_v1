import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PublicCv } from "./public-cv";
import type { CvData } from "../../lib/data/cv";

function makeData(overrides: Partial<CvData> = {}): CvData {
  return {
    locale: "fr",
    profile: {
      id: "p1",
      fullName: "Yohan Debusscher",
      headline: "Concepteur-développeur",
      currentRole: "Indépendant · fondateur",
      cvAccroche: "Vision, pilotage, exécution.",
      cvAvailabilityStart: "Immédiate",
      cvMobility: "Remote",
      cvContractType: "CDI",
    },
    experiences: [
      {
        id: "e1",
        title: "Directeur adjoint",
        company: "Indépendant",
        location: "HdF",
        startDate: new Date("2024-01-01"),
        endDate: null,
        stack: ["Next.js"],
        bullets: ["Livraison de bout en bout."],
        description: "Direction et livraison de produits.",
      },
    ],
    education: [{ id: "ed1", title: "Master informatique", institution: "Université", date: "2018 — 2020", details: [] }],
    skills: [{ id: "s1", name: "Full-stack", category: "Développement" }],
    softSkills: [{ id: "s2", name: "Leadership" }],
    projects: [{ id: "pr1", title: "Domestic Revolt", summary: "Jeu conçu et livré.", cvBadge: "KEY" }],
    kpis: [{ id: "k1", label: "Expérience", value: "4 ans" }],
    languages: [{ id: "l1", name: "Français", level: "Maternelle" }],
    interests: [{ id: "i1", label: "Course à pied" }],
    pdfs: { fr: "https://m/cv-fr.pdf", en: "https://m/cv-en.pdf" },
    ...overrides,
  } as unknown as CvData;
}

test("rend les sections riches du CV + descriptions longues", () => {
  render(<PublicCv data={makeData()} />);
  expect(screen.getByText("Yohan Debusscher")).toBeInTheDocument();
  expect(screen.getByText("Directeur adjoint", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("Direction et livraison de produits.")).toBeInTheDocument(); // long desc (page-only)
  expect(screen.getByText("Domestic Revolt", { exact: false })).toBeInTheDocument();
  expect(screen.getByText("Master informatique")).toBeInTheDocument();
});

test("affiche les boutons de téléchargement PDF disponibles", () => {
  render(<PublicCv data={makeData()} />);
  const fr = screen.getByText("PDF FR").closest("a");
  const en = screen.getByText("PDF EN").closest("a");
  expect(fr).toHaveAttribute("href", "https://m/cv-fr.pdf");
  expect(en).toHaveAttribute("href", "https://m/cv-en.pdf");
});

test("sans PDF généré, affiche un état vide", () => {
  render(<PublicCv data={makeData({ pdfs: {} })} />);
  expect(screen.getByText(/Bientôt disponible/)).toBeInTheDocument();
});
