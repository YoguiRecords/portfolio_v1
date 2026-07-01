import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ChatWidget } from "./chat-widget";

afterEach(() => {
  vi.restoreAllMocks();
});

test("le widget ouvre le panneau au clic sur la bulle", async () => {
  const user = userEvent.setup();
  render(<ChatWidget />);
  expect(screen.queryByLabelText("Message")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));
  expect(screen.getByLabelText("Message")).toBeInTheDocument();
});

test("le bouton Prendre RDV affiche le formulaire de réservation avec les créneaux", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ slots: ["2026-07-06T07:00:00.000Z"] }), {
      headers: { "content-type": "application/json" },
    }),
  );
  const user = userEvent.setup();
  render(<ChatWidget />);
  await user.click(screen.getByRole("button", { name: /Ouvrir le chat/i }));
  await user.click(screen.getByRole("button", { name: "Prendre RDV" }));

  expect(screen.getByLabelText("Prénom")).toBeInTheDocument();
  expect(screen.getByLabelText("Téléphone")).toBeInTheDocument();
  expect(await screen.findByRole("option", { name: /lundi 6 juillet/i })).toBeInTheDocument();
});
