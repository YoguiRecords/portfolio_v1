import { expect, test, vi } from "vitest";
import { aggregateInbox, type ContactMessageLike } from "./aggregate";

function mail(id: string, receivedAt: string) {
  return {
    id,
    fromAddress: `${id}@ext.test`,
    fromName: `Exp ${id}`,
    subject: `Sujet ${id}`,
    preview: "aperçu",
    body: "corps",
    receivedAt,
    isRead: false,
  };
}

const contact: ContactMessageLike = {
  id: "c1",
  name: "Alice",
  email: "alice@x.test",
  subject: null,
  message: "Bonjour, je vous contacte au sujet d'un projet.",
  isRead: false,
  createdAt: new Date("2026-06-29T12:00:00.000Z"),
};

test("fusionne mails + messages et trie par date décroissante", async () => {
  const mailbox = { listMessages: vi.fn().mockResolvedValue([mail("m1", "2026-06-29T08:00:00.000Z"), mail("m2", "2026-06-30T08:00:00.000Z")]) };
  const items = await aggregateInbox({ mailbox, listContactMessages: async () => [contact] }, "ALL");
  expect(items.map((i) => i.id)).toEqual(["m2", "c1", "m1"]);
  expect(items.find((i) => i.id === "c1")?.source).toBe("CONTACT");
});

test("le filtre MAIL ne renvoie que les mails (n'interroge pas les messages)", async () => {
  const mailbox = { listMessages: vi.fn().mockResolvedValue([mail("m1", "2026-06-29T08:00:00.000Z")]) };
  const listContactMessages = vi.fn();
  const items = await aggregateInbox({ mailbox, listContactMessages }, "MAIL");
  expect(items).toHaveLength(1);
  expect(items[0].source).toBe("MAIL");
  expect(listContactMessages).not.toHaveBeenCalled();
});

test("le filtre CONTACT ne renvoie que les messages (n'interroge pas le mailbox)", async () => {
  const mailbox = { listMessages: vi.fn() };
  const items = await aggregateInbox({ mailbox, listContactMessages: async () => [contact] }, "CONTACT");
  expect(items).toHaveLength(1);
  expect(items[0].source).toBe("CONTACT");
  expect(mailbox.listMessages).not.toHaveBeenCalled();
});

test("une panne du mailbox n'efface pas les messages de contact", async () => {
  const mailbox = { listMessages: vi.fn().mockRejectedValue(new Error("graph down")) };
  const items = await aggregateInbox({ mailbox, listContactMessages: async () => [contact] }, "ALL");
  expect(items).toHaveLength(1);
  expect(items[0].id).toBe("c1");
});
