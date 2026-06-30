import { z } from "zod";

/** CRM enumerations (mirror the Prisma enums). */
export const DEAL_STAGES = ["PROSPECT", "QUALIFIED", "PROPOSAL", "WON", "LOST"] as const;
export const ACTIVITY_TYPES = ["CALL", "EMAIL", "MEETING", "NOTE"] as const;
export const CRM_CONTACT_STATUSES = ["LEAD", "ACTIVE", "CUSTOMER", "ARCHIVED"] as const;

/** Company (organisation) input. */
export const CompanyInput = z.object({
  name: z.string().min(1).max(160),
  website: z.string().url().max(300).optional(),
  notes: z.string().max(4000).optional(),
});

/** Contact (person) input. Cross-domain links are loose optional ids. */
export const CrmContactInput = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional(),
  email: z.string().email().max(160).optional(),
  phone: z.string().max(40).optional(),
  role: z.string().max(120).optional(),
  source: z.string().max(80).optional(),
  status: z.enum(CRM_CONTACT_STATUSES).default("LEAD"),
  ownerNotes: z.string().max(4000).optional(),
  companyId: z.string().optional(),
  linkedProjectId: z.string().optional(),
  testimonialId: z.string().optional(),
  contactMessageId: z.string().optional(),
});

/** Deal (pipeline opportunity) input. */
export const DealInput = z.object({
  title: z.string().min(1).max(160),
  contactId: z.string().min(1),
  companyId: z.string().optional(),
  valueCents: z.number().int().min(0).optional(),
  stage: z.enum(DEAL_STAGES).default("PROSPECT"),
  probability: z.number().int().min(0).max(100).optional(),
  expectedCloseAt: z.coerce.date().optional(),
});

/** Activity (call/email/meeting/note) input — attached to a contact and/or deal. */
export const ActivityInput = z.object({
  type: z.enum(ACTIVITY_TYPES).default("NOTE"),
  content: z.string().min(1).max(4000),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
  occurredAt: z.coerce.date().optional(),
});

/** Task enumerations (mirror the Prisma enums). */
export const TASK_CATEGORIES = ["CRM", "CONTENT", "BILLING", "GENERAL"] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export const TASK_PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;

/** Unified task (todo) input — CRM follow-ups and general todos share this shape. */
export const TaskInput = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  category: z.enum(TASK_CATEGORIES).default("GENERAL"),
  status: z.enum(TASK_STATUSES).default("TODO"),
  priority: z.enum(TASK_PRIORITIES).default("NORMAL"),
  dueAt: z.coerce.date().optional(),
  contactId: z.string().optional(),
  dealId: z.string().optional(),
});

export type CompanyInput = z.infer<typeof CompanyInput>;
export type CrmContactInput = z.infer<typeof CrmContactInput>;
export type DealInput = z.infer<typeof DealInput>;
export type ActivityInput = z.infer<typeof ActivityInput>;
export type TaskInput = z.infer<typeof TaskInput>;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export type DealStage = (typeof DEAL_STAGES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type CrmContactStatus = (typeof CRM_CONTACT_STATUSES)[number];
