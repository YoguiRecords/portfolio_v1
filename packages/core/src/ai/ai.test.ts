import { expect, test, vi } from "vitest";
import { createOpenRouterLlm } from "./openrouter";
import { assistText } from "./assist";
import { assertBudget, estimateTokens, recordUsage } from "./budget";
import { mockLlm } from "../testing/mock-llm";

test("OpenRouter: requête bien formée (Authorization, model, messages) + réponse mappée", async () => {
  const fetchImpl = vi.fn(async () =>
    new Response(JSON.stringify({ choices: [{ message: { content: "Bonjour" } }] }), { status: 200 }),
  ) as unknown as typeof fetch;

  const llm = createOpenRouterLlm({ apiKey: "secret", model: "openrouter/fusion", fetchImpl });
  const out = await llm.complete({ system: "sys", messages: [{ role: "user", content: "hi" }] });

  expect(out.content).toBe("Bonjour");
  const [, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
  expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer secret" });
  const body = JSON.parse((init as RequestInit).body as string);
  expect(body.model).toBe("openrouter/fusion");
  expect(body.messages[0]).toEqual({ role: "system", content: "sys" });
});

test("assistText: chaque action passe le bon system prompt et renvoie la suggestion", async () => {
  const llm = mockLlm(["Texte reformulé"]);
  const out = await assistText(llm, { action: "rephrase", text: "mon texte" });
  expect(out).toBe("Texte reformulé");
  expect(llm.calls[0].system).toMatch(/Reformule/);
});

test("budget: refuse au-delà du plafond, recordUsage cumule", () => {
  const budget = { monthlyTokenBudget: 1000, tokensUsedThisMonth: 900 };
  expect(() => assertBudget(budget, 50)).not.toThrow();
  expect(() => assertBudget(budget, 200)).toThrow(/ai_budget_exceeded/);
  expect(recordUsage(budget, 50).tokensUsedThisMonth).toBe(950);
});

test("estimateTokens: ≈ 4 caractères par token, arrondi supérieur, facteur de marge", () => {
  expect(estimateTokens("abcd")).toBe(1);
  expect(estimateTokens("abcde")).toBe(2);
  expect(estimateTokens("abcd", 2)).toBe(2);
  expect(estimateTokens("")).toBe(0);
});
