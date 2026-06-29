// @vitest-environment node
import { expect, test } from "vitest";
import { DemoMailbox } from "./demo-mailbox";

test("DemoMailbox liste l'inbox triée du plus récent au plus ancien", async () => {
  const box = new DemoMailbox();
  const msgs = await box.listMessages("inbox");
  expect(msgs.length).toBeGreaterThan(0);
  for (let i = 1; i < msgs.length; i += 1) {
    expect(msgs[i - 1].receivedAt >= msgs[i].receivedAt).toBe(true);
  }
});

test("DemoMailbox: getMessage puis markRead bascule l'état lu", async () => {
  const box = new DemoMailbox();
  const [first] = await box.listMessages("inbox");
  await box.markRead(first.id, true);
  const reloaded = await box.getMessage(first.id);
  expect(reloaded?.isRead).toBe(true);
});

test("DemoMailbox: le dossier 'sent' est vide en démo", async () => {
  const box = new DemoMailbox();
  expect(await box.listMessages("sent")).toEqual([]);
});
