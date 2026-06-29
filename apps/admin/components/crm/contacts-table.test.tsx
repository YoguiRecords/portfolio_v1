import { vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/contacts" }));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi as vitest } from "vitest";
import { ContactsTable, type ContactRow } from "./contacts-table";

const contacts: ContactRow[] = [
  { id: "1", firstName: "Alice", lastName: "Martin", email: "alice@x.test", companyName: "Acme", status: "LEAD" },
  { id: "2", firstName: "Bob", lastName: null, email: "bob@x.test", companyName: null, status: "CUSTOMER" },
];

function makeActions() {
  return { create: vitest.fn(), remove: vitest.fn() };
}

test("filtre les contacts par statut", async () => {
  render(<ContactsTable contacts={contacts} actions={makeActions()} />);
  expect(screen.getByText("Alice Martin")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Clients" }));
  expect(screen.queryByText("Alice Martin")).not.toBeInTheDocument();
  expect(screen.getByText(/Bob/)).toBeInTheDocument();
});

test("la suppression demande confirmation", async () => {
  render(<ContactsTable contacts={contacts} actions={makeActions()} />);
  await userEvent.click(screen.getAllByRole("button", { name: "Supprimer" })[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();
});
