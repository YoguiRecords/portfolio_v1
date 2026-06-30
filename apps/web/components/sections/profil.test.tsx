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

function renderWith(analyses: unknown) {
  render(<Profil section={section} kpis={[]} analyses={analyses as HomeData["analyses"]} />);
}

test("rend une tuile SWOT (badge libellé + puce) depuis le payload data", () => {
  renderWith([
    {
      id: "a1",
      type: "SWOT",
      title: "Mon profil",
      data: {
        strengths: { label: "Forces", items: ["Vision + exécution"] },
        weaknesses: { label: "Faiblesses", items: [] },
        opportunities: { label: "Opportunités", items: [] },
        threats: { label: "Menaces", items: [] },
      },
    },
  ]);
  expect(screen.getByText("Vision + exécution")).toBeInTheDocument();
  expect(screen.getByText("Forces")).toBeInTheDocument();
});

test("rend une colonne 4P (levier + rôle + puce)", () => {
  renderWith([
    {
      id: "a2",
      type: "FOUR_P",
      title: "Mon positionnement",
      data: {
        product: { label: "Produit", role: "L'offre", points: ["Vision produit"] },
        price: { label: "Prix", role: "Positionnement", points: [] },
        place: { label: "Place", role: "Distribution", points: [] },
        promotion: { label: "Promotion", role: "Communication", points: [] },
      },
    },
  ]);
  expect(screen.getByText("Produit")).toBeInTheDocument();
  expect(screen.getByText("Vision produit")).toBeInTheDocument();
});

test("rend le Golden Circle (why/how/what)", () => {
  renderWith([
    {
      id: "a3",
      type: "GOLDEN_CIRCLE",
      title: "Ma raison d'être",
      data: { why: "Du sens", how: "En reliant", what: "Je dirige" },
    },
  ]);
  expect(screen.getByText("Du sens")).toBeInTheDocument();
  expect(screen.getByText("Je dirige")).toBeInTheDocument();
});

test("rend l'Ikigai (zones + centre)", () => {
  renderWith([
    {
      id: "a4",
      type: "IKIGAI",
      title: "Mon équilibre",
      data: { love: "Construire", good: "Relier", world: "Utile", paid: "Diriger", center: "Synthèse" },
    },
  ]);
  expect(screen.getByText("Construire")).toBeInTheDocument();
  expect(screen.getByText("Synthèse")).toBeInTheDocument();
});

test("ignore un payload invalide (fail-safe : rien rendu)", () => {
  renderWith([{ id: "a5", type: "SWOT", title: null, data: { nope: true } }]);
  expect(screen.queryByText(/SWOT/)).not.toBeInTheDocument();
});
