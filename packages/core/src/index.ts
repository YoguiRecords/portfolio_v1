/**
 * Shared types & utilities for the portfolio monorepo.
 *
 * Placeholder export — real shared logic (webp helpers, domain types) lands
 * with the dedicated features.
 */

/** Public sections exposed by the portfolio site. */
export type PortfolioSection = "cv" | "projects" | "newsletter";

/** Identifies the running app within the monorepo. */
export type AppName = "web" | "admin";

// Auth (back office)
export { hashPassword, verifyPassword } from "./auth/password";
export { generateSessionToken, hashToken } from "./auth/token";
export { generateTotpSecret, buildTotpKeyUri, verifyTotp } from "./auth/totp";

// AI (LLM port — OpenRouter implementation lands in P14/P15)
export type {
  Llm,
  LlmMessage,
  LlmRequest,
  LlmResult,
} from "./ai/llm";
