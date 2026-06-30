import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { CvDocument } from "./cv-document";
import type { CvDocumentData } from "@/lib/data/cv-document";

function makeData(overrides: Partial<CvDocumentData> = {}): CvDocumentData {
  return {
    locale: "fr",
    profile: {
      id: "p1",
      fullName: "Yohan Debusscher",
      headline: "Concepteur-développeur",
      currentRole: "Indépendant · fondateur",
      email: "y@example.com",
      location: "Hauts-de-France",
      cvAccroche: "Vision produit, pilotage et exécution.",
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
        tier: "FEATURED",
        badge: "EN_COURS",
        stack: ["Next.js"],
        bullets: ["Livraison de bout en bout."],
        description: null,
      },
    ],
    education: [{ id: "ed1", title: "Master informatique", institution: "Université", date: "2018 — 2020", details: [] }],
    skills: [{ id: "s1", name: "Full-stack", category: "Développement" }],
    softSkills: [{ id: "s2", name: "Leadership" }],
    projects: [{ id: "pr1", title: "Domestic Revolt", summary: "Jeu conçu et livré.", cvBadge: "KEY" }],
    kpis: [{ id: "k1", label: "Expérience", value: "4 ans" }],
    languages: [{ id: "l1", name: "Français", level: "Maternelle" }],
    interests: [{ id: "i1", label: "Course à pied" }],
    ...overrides,
  } as unknown as CvDocumentData;
}

test("rend les sections clés du CV à partir des données projetées", () => {
  render(<CvDocument data={makeData()} />);
  expect(screen.getByText("Yohan Debusscher")).toBeInTheDocument();
  expect(screen.getByText("Directeur adjoint")).toBeInTheDocument();
  expect(screen.getByText("Master informatique")).toBeInTheDocument();
  expect(screen.getByText("Domestic Revolt")).toBeInTheDocument();
  expect(screen.getByText("Projet clé")).toBeInTheDocument(); // badge KEY (FR)
  expect(screen.getByText("Course à pied")).toBeInTheDocument();
});

test("localise les libellés de section en anglais", () => {
  render(<CvDocument data={makeData({ locale: "en" })} />);
  expect(screen.getByText("Experience")).toBeInTheDocument();
  expect(screen.getByText("Education")).toBeInTheDocument();
  expect(screen.getByText("Key project")).toBeInTheDocument(); // badge KEY (EN)
});
