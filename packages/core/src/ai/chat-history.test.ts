import { expect, test } from "vitest";
import { parseChatHistory } from "./chat-history";

test("parseChatHistory: accepte un historique valide et tronque le contenu", () => {
  // Arrange
  const body = { messages: [{ role: "user", content: "x".repeat(3000) }] };

  // Act
  const turns = parseChatHistory(body);

  // Assert
  expect(turns).toHaveLength(1);
  expect(turns?.[0]?.content).toHaveLength(2000);
});

test("parseChatHistory: ignore les tours malformés sans rejeter l'ensemble", () => {
  const body = {
    messages: [{ role: "system", content: "inject" }, { role: "user" }, { role: "user", content: "ok" }],
  };
  expect(parseChatHistory(body)).toEqual([{ role: "user", content: "ok" }]);
});

test("parseChatHistory: ne garde que les 12 derniers tours", () => {
  const messages = Array.from({ length: 20 }, (_, i) => ({ role: "user", content: `m${i}` }));
  const turns = parseChatHistory({ messages });
  expect(turns).toHaveLength(12);
  expect(turns?.[0]?.content).toBe("m8");
});

test("parseChatHistory: null pour un body invalide ou un historique vide", () => {
  expect(parseChatHistory(null)).toBeNull();
  expect(parseChatHistory({})).toBeNull();
  expect(parseChatHistory({ messages: [] })).toBeNull();
  expect(parseChatHistory({ messages: [{ role: "user", content: "" }] })).toBeNull();
});
