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

// i18n (overlay localize + AI translation + change detection)
export { localize, type FieldTranslation } from "./i18n/localize";
export { translateFields, type TranslatedField } from "./i18n/translate";
export { frChanged, type SourceHashed } from "./i18n/changed";
export { hashSource } from "./i18n/hash";

// Testimonials (public submission schema)
export { TestimonialInput } from "./testimonials/schema";

// Contact & appointment (public submission schemas)
export { ContactInput, AppointmentInput } from "./contact/schema";

// Admin content editing schemas
export {
  KpiInput,
  SkillInput,
  CareerGoalInput,
  HomeSectionInput,
  ProfileInput,
  ProjectInput,
  ArticleInput,
  EventInput,
  ReorderItem,
} from "./admin/content-schemas";

// Media upload validation (mime/size/dimensions)
export { validateUpload, ALLOWED_IMAGE_MIME, type UploadCandidate } from "./media/validate";

// Security (in-memory rate limiter)
export { allow, resetRateLimit, type RateLimitOptions } from "./security/rate-limit";

// Scheduled publishing (cron trigger logic)
export { isDue, splitDue } from "./publishing/due";
export type { Schedulable } from "./publishing/due";

// Project blocks (Zod schemas + safe parser for the modular case-study blocks)
export {
  blockSchemas,
  parseBlock,
  type ParsedBlock,
  type ProjectBlockKind,
  type ContextData,
  type ProcessData,
  type AnalysisData,
  type GameDesignData,
  type ArchitectureData,
  type SecurityData,
  type DesignUxData,
  type MetricsData,
  type RecommendationsData,
  type ResultsData,
  type GalleryData,
  type TextData,
} from "./project-blocks/schemas";

// AI (LLM port + OpenRouter adapter + assistance + budget guard)
export type {
  Llm,
  LlmMessage,
  LlmRequest,
  LlmResult,
} from "./ai/llm";
export { createOpenRouterLlm, type OpenRouterOptions } from "./ai/openrouter";
export { assistText, type AssistAction } from "./ai/assist";
export { assertBudget, recordUsage, type AiBudget } from "./ai/budget";
export { buildContext, type ChatContextInput } from "./ai/chat-context";
export { buildSystemPrompt } from "./ai/guardrails";
