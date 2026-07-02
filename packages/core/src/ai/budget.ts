/**
 * Rough token estimate (≈ 4 chars/token) for the budget guard.
 *
 * @param text - The text whose cost is estimated.
 * @param factor - Optional safety margin multiplier (e.g. 2 to over-provision
 *   for prompt overhead).
 * @returns The estimated token count (integer, rounded up).
 */
export function estimateTokens(text: string, factor = 1): number {
  return Math.ceil((text.length * factor) / 4);
}

/** The token budget state (mirrors `AiAssistantConfig`). */
export interface AiBudget {
  monthlyTokenBudget: number;
  tokensUsedThisMonth: number;
}

/**
 * Throws when a request's estimated token cost would exceed the monthly budget.
 *
 * @throws Error `ai_budget_exceeded`.
 */
export function assertBudget(budget: AiBudget, estimatedTokens: number): void {
  if (budget.tokensUsedThisMonth + estimatedTokens > budget.monthlyTokenBudget) {
    throw new Error("ai_budget_exceeded");
  }
}

/** Returns a new budget state with `usedTokens` added to the running total. */
export function recordUsage(budget: AiBudget, usedTokens: number): AiBudget {
  return { ...budget, tokensUsedThisMonth: budget.tokensUsedThisMonth + usedTokens };
}
