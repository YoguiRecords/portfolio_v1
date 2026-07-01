import { z } from "zod";
import { ANALYSIS_TYPES } from "../profile-analyses/schemas";

/**
 * Zod schemas for back-office content editing. Shared so the Server Actions
 * (write side) and any client-side validation agree on the contract.
 */

const trend = z.enum(["UP", "DOWN", "FLAT"]);

/** KPI (indicator card). */
export const KpiInput = z.object({
  label: z.string().min(1).max(60),
  value: z.string().min(1).max(60),
  note: z.string().max(80).optional(),
  trend: trend.optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
  showOnCv: z.boolean().default(false),
});

/** Skill (ecosystem orbit + CV competences/soft skills). */
export const SkillInput = z.object({
  name: z.string().min(1).max(60),
  category: z.string().max(60).optional(),
  kind: z.enum(["TECH", "SOFT"]).default("TECH"),
  showOnCv: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});

/** Career goal (the "cap"). */
export const CareerGoalInput = z.object({
  role: z.string().min(1).max(80),
  status: z.enum(["ACHIEVED", "IN_PROGRESS", "TARGET", "HORIZON"]).default("TARGET"),
  order: z.number().int().min(0).default(0),
});

/** Career goal update (edit an existing row — requires its id). */
export const CareerGoalUpdate = CareerGoalInput.extend({ id: z.string().min(1) });

// ── CV corpus (experiences, education, languages, interests) ──

/** Experience (CV corpus — projected onto PDF / /cv page / home via flags). */
export const ExperienceInput = z.object({
  title: z.string().min(1).max(160),
  company: z.string().min(1).max(120),
  location: z.string().max(160).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  tier: z.enum(["FEATURED", "PREVIOUS", "MINI"]).default("MINI"),
  badge: z.enum(["NONE", "PERSO", "EN_COURS", "CLE"]).default("NONE"),
  stack: z.array(z.string().min(1).max(40)).max(24).default([]),
  bullets: z.array(z.string().min(1).max(280)).max(12).default([]),
  description: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0),
  showOnPdf: z.boolean().default(false),
  showOnCvPage: z.boolean().default(true),
  showOnSite: z.boolean().default(false),
});

/** Education entry (CV « Formations » chapter). */
export const EducationInput = z.object({
  title: z.string().min(1).max(160),
  institution: z.string().max(160).optional(),
  date: z.string().min(1).max(60),
  details: z.array(z.string().min(1).max(200)).max(8).default([]),
  order: z.number().int().min(0).default(0),
  showOnPdf: z.boolean().default(true),
  showOnCvPage: z.boolean().default(true),
});

/** Language (CV sidebar). */
export const LanguageInput = z.object({
  name: z.string().min(1).max(60),
  level: z.string().min(1).max(60),
  order: z.number().int().min(0).default(0),
});

/** Interest (CV sidebar). */
export const InterestInput = z.object({
  label: z.string().min(1).max(80),
  order: z.number().int().min(0).default(0),
});

/** Update variants (edit an existing row — require its id). */
export const ExperienceUpdate = ExperienceInput.extend({ id: z.string().min(1) });
export const EducationUpdate = EducationInput.extend({ id: z.string().min(1) });
export const LanguageUpdate = LanguageInput.extend({ id: z.string().min(1) });
export const InterestUpdate = InterestInput.extend({ id: z.string().min(1) });

/** Home section (editorial copy + order/visibility). */
export const HomeSectionInput = z.object({
  key: z.string().min(1).max(40),
  navLabel: z.string().max(40).optional(),
  eyebrow: z.string().max(120).optional(),
  title: z.string().max(160).optional(),
  intro: z.string().max(400).optional(),
  ctaLabel: z.string().max(60).optional(),
  ctaHref: z.string().max(200).optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});

/** Profile (singleton — hero/identity). */
export const ProfileInput = z.object({
  fullName: z.string().min(1).max(120),
  headline: z.string().min(1).max(160),
  bio: z.string().min(1).max(2000),
  email: z.string().email().max(120),
  location: z.string().max(120).optional(),
  typewriterLines: z.array(z.string().min(1).max(80)).max(8).default([]),
  sigText: z.string().max(120).optional(),
  isAvailable: z.boolean().default(true),
  availabilityLabel: z.string().max(120).optional(),
  currentRole: z.string().max(120).optional(),
  aiSummary: z.string().max(600).optional(),
  // CV — champs spécifiques au document
  cvAccroche: z.string().max(600).optional(),
  cvAvailabilityStart: z.string().max(80).optional(),
  cvMobility: z.string().max(160).optional(),
  cvContractType: z.string().max(80).optional(),
});

/** Project case-study header (blocks are edited separately). */
export const ProjectInput = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug: minuscules, chiffres et tirets uniquement"),
  summary: z.string().min(1).max(400),
  content: z.string().min(1).max(8000),
  type: z.enum(["GAME", "SOFTWARE", "WEBSITE", "BUSINESS"]).default("SOFTWARE"),
  // Optional strings accept null (Prisma returns null for empty nullable columns):
  // the update action merges the current record, so `.nullish()` avoids a Zod
  // "expected string, received null" failure when saving a project whose optional
  // fields are still empty (e.g. a freshly created draft).
  role: z.string().max(120).nullish(),
  periodLabel: z.string().max(60).nullish(),
  statusLabel: z.string().max(60).nullish(),
  tagline: z.string().max(200).nullish(),
  sigText: z.string().max(120).nullish(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  showOnCv: z.boolean().default(false),
  cvBadge: z.enum(["NONE", "KEY", "IN_PROGRESS"]).default("NONE"),
  seoTitle: z.string().max(160).nullish(),
  seoDescription: z.string().max(300).nullish(),
  aiSummary: z.string().max(600).nullish(),
});

/** Article (news) with scheduled publishing. */
export const ArticleInput = z
  .object({
    title: z.string().min(1).max(160),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "slug: minuscules, chiffres et tirets uniquement"),
    excerpt: z.string().min(1).max(400),
    content: z.string().min(1).max(20000),
    tags: z.array(z.string().min(1).max(40)).max(12).default([]),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
    scheduledAt: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    readingMinutes: z.number().int().min(1).max(120).optional(),
    seoTitle: z.string().max(160).optional(),
    seoDescription: z.string().max(300).optional(),
    aiSummary: z.string().max(600).optional(),
    eventId: z.string().optional(),
  })
  .refine((v) => v.status !== "SCHEDULED" || v.scheduledAt != null, {
    message: "Une actu programmée exige une date (scheduledAt).",
    path: ["scheduledAt"],
  });

/** Agenda event with optional scheduled publishing. */
export const EventInput = z
  .object({
    title: z.string().min(1).max(160),
    slug: z
      .string()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9-]+$/, "slug: minuscules, chiffres et tirets uniquement"),
    description: z.string().max(8000).optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date().optional(),
    locationName: z.string().max(160).optional(),
    city: z.string().max(120).optional(),
    isOnline: z.boolean().default(false),
    onlineUrl: z.string().url().max(300).optional(),
    registrationUrl: z.string().url().max(300).optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
    status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
    scheduledAt: z.coerce.date().optional(),
  })
  .refine((v) => v.status !== "SCHEDULED" || v.scheduledAt != null, {
    message: "Un évènement programmé exige une date (scheduledAt).",
    path: ["scheduledAt"],
  });

/** A new order assignment for a single row (used by reorder actions). */
export const ReorderItem = z.object({ id: z.string().min(1), order: z.number().int().min(0) });

export type KpiInput = z.infer<typeof KpiInput>;
export type SkillInput = z.infer<typeof SkillInput>;
export type CareerGoalInput = z.infer<typeof CareerGoalInput>;
export type CareerGoalUpdate = z.infer<typeof CareerGoalUpdate>;
export type ExperienceInput = z.infer<typeof ExperienceInput>;
export type ExperienceUpdate = z.infer<typeof ExperienceUpdate>;
export type EducationInput = z.infer<typeof EducationInput>;
export type EducationUpdate = z.infer<typeof EducationUpdate>;
export type LanguageInput = z.infer<typeof LanguageInput>;
export type LanguageUpdate = z.infer<typeof LanguageUpdate>;
export type InterestInput = z.infer<typeof InterestInput>;
export type InterestUpdate = z.infer<typeof InterestUpdate>;
export type HomeSectionInput = z.infer<typeof HomeSectionInput>;
export type ProfileInput = z.infer<typeof ProfileInput>;
export type ProjectInput = z.infer<typeof ProjectInput>;
export type ArticleInput = z.infer<typeof ArticleInput>;
export type EventInput = z.infer<typeof EventInput>;
export type ReorderItem = z.infer<typeof ReorderItem>;

/** Site-wide settings (branding, SEO defaults, footer, contact, AI crawlers). */
export const SiteSettingsInput = z.object({
  brandName: z.string().max(60).optional(),
  siteName: z.string().max(120).optional(),
  defaultSeoTitle: z.string().max(160).optional(),
  defaultSeoDescription: z.string().max(320).optional(),
  footerHeadline: z.string().max(160).optional(),
  footerSignature: z.string().max(160).optional(),
  contactEmail: z.string().email().max(160).optional(),
  availabilityBanner: z.string().max(200).optional(),
  isContactFormEnabled: z.boolean().default(true),
  allowAiCrawlers: z.boolean().default(true),
  llmsTxt: z.string().max(8000).optional(),
  robotsExtra: z.string().max(2000).optional(),
});
export type SiteSettingsInput = z.infer<typeof SiteSettingsInput>;

/** A FAQ entry (global, home, or scoped to a project/article). */
export const FaqInput = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
  scope: z.enum(["GLOBAL", "HOME", "PROJECT", "ARTICLE"]).default("GLOBAL"),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});
export type FaqInput = z.infer<typeof FaqInput>;

/** A career track (lane in the parcours timeline). */
export const CareerTrackInput = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().min(1).max(60),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Couleur hex attendue (#RRGGBB)")
    .default("#f0a800"),
  order: z.number().int().min(0).default(0),
});
export type CareerTrackInput = z.infer<typeof CareerTrackInput>;

/** A milestone within a career track. */
export const CareerMilestoneInput = z.object({
  trackId: z.string().min(1),
  dateLabel: z.string().min(1).max(40),
  sortYear: z.number().int(),
  role: z.string().min(1).max(120),
  description: z.string().max(400).optional(),
  order: z.number().int().min(0).default(0),
});
export type CareerMilestoneInput = z.infer<typeof CareerMilestoneInput>;

/**
 * A profile analysis block (SWOT / 4P / Golden Circle / Ikigai). The heterogeneous
 * `data` JSON payload is validated per-type by the core `analysisSchemas`
 * (see `parseAnalysis`) at the Server Action boundary.
 */
export const AnalysisInput = z.object({
  type: z.enum(ANALYSIS_TYPES),
  title: z.string().max(120).optional(),
  order: z.number().int().min(0).default(0),
  isVisible: z.boolean().default(true),
});
export type AnalysisInput = z.infer<typeof AnalysisInput>;
