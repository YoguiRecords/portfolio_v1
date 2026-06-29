import { z } from "zod";

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
});

/** Skill (ecosystem orbit). */
export const SkillInput = z.object({
  name: z.string().min(1).max(60),
  category: z.string().max(60).optional(),
  order: z.number().int().min(0).default(0),
});

/** Career goal (the "cap"). */
export const CareerGoalInput = z.object({
  role: z.string().min(1).max(80),
  status: z.enum(["ACHIEVED", "IN_PROGRESS", "TARGET", "HORIZON"]).default("TARGET"),
  order: z.number().int().min(0).default(0),
});

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
  role: z.string().max(120).optional(),
  periodLabel: z.string().max(60).optional(),
  statusLabel: z.string().max(60).optional(),
  tagline: z.string().max(200).optional(),
  sigText: z.string().max(120).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  seoTitle: z.string().max(160).optional(),
  seoDescription: z.string().max(300).optional(),
  aiSummary: z.string().max(600).optional(),
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
export type HomeSectionInput = z.infer<typeof HomeSectionInput>;
export type ProfileInput = z.infer<typeof ProfileInput>;
export type ProjectInput = z.infer<typeof ProjectInput>;
export type ArticleInput = z.infer<typeof ArticleInput>;
export type EventInput = z.infer<typeof EventInput>;
export type ReorderItem = z.infer<typeof ReorderItem>;
