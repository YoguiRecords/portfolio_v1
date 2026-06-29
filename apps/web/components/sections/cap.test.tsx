import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Cap } from "./cap";
import type { HomeData } from "../../lib/data/home";

const section = {
  id: "s1",
  key: "cap",
  title: "Le cap",
} as unknown as HomeData["sections"][number];

test("Cap marque un objectif ACHIEVED comme acquis et compte les atteints", () => {
  const goals = [
    { id: "g1", role: "Développeur", status: "ACHIEVED" },
    { id: "g2", role: "CTO", status: "TARGET" },
  ] as unknown as HomeData["goals"];

  render(<Cap section={section} goals={goals} />);
  expect(screen.getByText("Acquis")).toBeInTheDocument();
  expect(screen.getByText("01 / 02 atteints")).toBeInTheDocument();
});
