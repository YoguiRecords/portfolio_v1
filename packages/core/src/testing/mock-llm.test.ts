import { expect, test } from "vitest";
import { mockLlm } from "./mock-llm";

test("mockLlm returns the queued reply and records the prompt", async () => {
  const llm = mockLlm(["Bonjour, je suis l'assistant de Yohan."]);
  const out = await llm.complete({
    system: "sys",
    messages: [{ role: "user", content: "hi" }],
  });
  expect(out.content).toContain("Yohan");
  expect(llm.calls).toHaveLength(1);
});
