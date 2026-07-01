import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { RdvList, type RdvRow } from "./rdv-list";

const requests: RdvRow[] = [
  { id: "1", name: "Alice", email: "a@x.test", phone: "+33600000000", topic: "Démo", message: null, status: "PENDING", requestedAtLabel: "01/07 10:00" },
  { id: "2", name: "Bob", email: "b@x.test", phone: null, topic: null, message: null, status: "CONFIRMED", requestedAtLabel: null },
];

function makeActions() {
  return { confirm: vi.fn(), decline: vi.fn(), cancel: vi.fn() };
}

test("affiche accepter/refuser pour une demande en attente", () => {
  render(<RdvList requests={requests} actions={makeActions()} />);
  expect(screen.getByRole("button", { name: "Accepter" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Refuser" })).toBeInTheDocument();
});

test("le refus demande confirmation", async () => {
  render(<RdvList requests={requests} actions={makeActions()} />);
  await userEvent.click(screen.getByRole("button", { name: "Refuser" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});

test("filtre par statut", async () => {
  render(<RdvList requests={requests} actions={makeActions()} />);
  await userEvent.click(screen.getByRole("button", { name: "Confirmés" }));
  expect(screen.getByText("Bob")).toBeInTheDocument();
  expect(screen.queryByText("Alice")).not.toBeInTheDocument();
});

test("un RDV confirmé propose l'annulation (avec confirmation)", async () => {
  render(<RdvList requests={requests} actions={makeActions()} />);
  await userEvent.click(screen.getByRole("button", { name: "Confirmés" }));
  await userEvent.click(screen.getByRole("button", { name: "Annuler" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Annuler le RDV" })).toBeInTheDocument();
});
