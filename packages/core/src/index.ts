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
export {
  BO_MODULES,
  ROLE_PRESETS,
  effectivePermissions,
  can,
  presetFor,
  isReadOnly,
  type BoModule,
  type AdminRole,
  type PermissionUser,
} from "./auth/permissions";
export { checkPasswordStrength, type PasswordCheck } from "./auth/password-policy";
export { generateSessionToken, hashToken } from "./auth/token";
export { generateTotpSecret, buildTotpKeyUri, verifyTotp } from "./auth/totp";

// i18n (overlay localize + AI translation + change detection)
export { localize, type FieldTranslation } from "./i18n/localize";
export { translateFields, type TranslatedField } from "./i18n/translate";
export { frChanged, type SourceHashed } from "./i18n/changed";
export { hashSource } from "./i18n/hash";

// Testimonials (public submission schema)
export { TestimonialInput, TESTIMONIAL_RELATIONSHIPS } from "./testimonials/schema";
export type { TestimonialRelationship } from "./testimonials/schema";

// Contact & appointment (public submission schemas)
export { ContactInput, AppointmentInput, BookingInput } from "./contact/schema";

// Booking (free-slot availability computation)
export {
  computeFreeSlots,
  DEFAULT_AVAILABILITY,
  type AvailabilityConfig,
  type BusyInterval,
  type Slot,
} from "./booking/availability";
export { UnavailabilityInput } from "./booking/schema";

// Admin content editing schemas
export {
  KpiInput,
  SkillInput,
  CareerGoalInput,
  CareerGoalUpdate,
  ExperienceInput,
  ExperienceUpdate,
  EducationInput,
  EducationUpdate,
  LanguageInput,
  LanguageUpdate,
  InterestInput,
  InterestUpdate,
  CareerTrackInput,
  CareerMilestoneInput,
  AnalysisInput,
  SiteSettingsInput,
  FaqInput,
  HomeSectionInput,
  ProfileInput,
  ProjectInput,
  ArticleInput,
  EventInput,
  ReorderItem,
} from "./admin/content-schemas";

// CRM schemas & types (private back-office data)
export {
  CompanyInput,
  CrmContactInput,
  DealInput,
  ActivityInput,
  TaskInput,
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  DEAL_STAGES,
  ACTIVITY_TYPES,
  CRM_CONTACT_STATUSES,
  type TaskCategory,
  type TaskStatus,
  type TaskPriority,
  type DealStage,
  type ActivityType,
  type CrmContactStatus,
} from "./crm/schemas";

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

// Profile analyses (SWOT / 4P / Golden Circle / Ikigai — chapter "Qui je suis")
export {
  ANALYSIS_TYPES,
  ANALYSIS_TYPE_LABELS,
  ANALYSIS_DEFAULTS,
  analysisSchemas,
  parseAnalysis,
  SwotData,
  FourPData,
  GoldenCircleData,
  IkigaiData,
  type AnalysisType,
  type ParsedAnalysis,
  type SwotData as SwotDataType,
  type FourPData as FourPDataType,
  type GoldenCircleData as GoldenCircleDataType,
  type IkigaiData as IkigaiDataType,
} from "./profile-analyses/schemas";

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
