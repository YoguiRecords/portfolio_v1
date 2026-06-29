import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { MediaGrid, type MediaRow } from "./media-grid";

const assets: MediaRow[] = [
  {
    id: "1",
    url: "https://media.test/a.webp",
    alt: "Une image",
    originalName: "hero.jpg",
    mimeType: "image/webp",
    sizeBytes: 2048,
    width: 1200,
    height: 800,
    kind: "IMAGE",
    durationSec: null,
    createdAtLabel: "29/06/2026",
  },
];

test("affiche l'état vide sans média", () => {
  render(<MediaGrid assets={[]} />);
  expect(screen.getByText("Aucun média importé.")).toBeInTheDocument();
});

test("ouvre le panneau de détails au clic", async () => {
  render(<MediaGrid assets={assets} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Détails de hero.jpg" }));
  const dialog = screen.getByRole("dialog");
  expect(dialog).toBeInTheDocument();
  expect(screen.getByText("hero.jpg")).toBeInTheDocument();
  expect(screen.getByText("1200 × 800px")).toBeInTheDocument();
  expect(screen.getByText("2 Ko")).toBeInTheDocument();
});
