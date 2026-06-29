import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { InboxList } from "./inbox-list";
import type { InboxItem } from "@/lib/inbox/aggregate";

const items: InboxItem[] = [
  { id: "m1", source: "MAIL", from: "Client", contactEmail: "c@x.test", subject: "Devis", preview: "Bonjour", date: "2026-06-30T10:00:00.000Z", isRead: false },
  { id: "c1", source: "CONTACT", from: "Alice", contactEmail: "a@x.test", subject: "Projet", preview: "Salut", date: "2026-06-29T10:00:00.000Z", isRead: true },
];

test("liste les items et lie vers le détail par source", () => {
  render(<InboxList items={items} />);
  expect(screen.getByText(/Devis/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Devis/ })).toHaveAttribute("href", "/inbox/mail/m1");
});

test("filtre par source Contact", async () => {
  render(<InboxList items={items} />);
  await userEvent.click(screen.getByRole("button", { name: "📨 Contact" }));
  expect(screen.getByText(/Projet/)).toBeInTheDocument();
  expect(screen.queryByText(/Devis/)).not.toBeInTheDocument();
});
