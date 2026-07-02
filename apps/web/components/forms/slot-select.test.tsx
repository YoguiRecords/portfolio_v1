import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { SlotSelect } from "./slot-select";

afterEach(() => {
  vi.restoreAllMocks();
});

test("SlotSelect: charge les créneaux et les groupe par jour, option vide en tête", async () => {
  // Arrange
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ slots: ["2026-07-06T07:00:00.000Z", "2026-07-06T08:00:00.000Z"] }), {
      headers: { "content-type": "application/json" },
    }),
  );

  // Act
  render(<SlotSelect name="requestedAt" />);

  // Assert
  expect(await screen.findByRole("group", { name: /lundi 6 juillet/i })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "— Aucun créneau précis —" })).toBeInTheDocument();
  expect(screen.getAllByRole("option")).toHaveLength(3);
});

test("SlotSelect: message dédié quand aucun créneau n'est libre", async () => {
  // Arrange
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ slots: [] }), { headers: { "content-type": "application/json" } }),
  );

  // Act
  render(<SlotSelect name="requestedAt" />);

  // Assert
  expect(await screen.findByRole("option", { name: /Aucun créneau disponible/ })).toBeInTheDocument();
});
