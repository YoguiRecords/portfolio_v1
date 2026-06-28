import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Parcours } from "./parcours";
import type { HomeData } from "../../lib/data/home";

const section = {
  id: "s1",
  key: "parcours",
  title: "La trajectoire",
} as unknown as HomeData["sections"][number];

test("Parcours rend le rôle d'un jalon de voie", () => {
  const tracks = [
    {
      id: "t1",
      name: "Dev",
      colorHex: "#f0a800",
      milestones: [
        { id: "m1", dateLabel: "2019", sortYear: 2019, role: "Développeur", description: "Premières livraisons." },
      ],
    },
  ] as unknown as HomeData["tracks"];

  render(<Parcours section={section} tracks={tracks} currentRole="Fondateur" signature="sig" />);
  expect(screen.getByText("Développeur")).toBeInTheDocument();
  expect(screen.getByText("Fondateur")).toBeInTheDocument();
});
