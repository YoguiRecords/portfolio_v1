import type { PrismaClient } from "../../generated/prisma/client";

type ProjectType = "GAME" | "SOFTWARE" | "WEBSITE" | "BUSINESS";

/**
 * Persists a minimal {@link Profile} singleton with sane defaults.
 *
 * @param prisma - client bound to the test database.
 * @param o - optional field overrides.
 * @returns the created profile row.
 */
export function createProfile(
  prisma: PrismaClient,
  o: Partial<{ fullName: string; email: string }> = {},
) {
  return prisma.profile.create({
    data: {
      fullName: o.fullName ?? "Yohan Debusscher",
      headline: "Test",
      bio: "Test",
      email: o.email ?? "test@example.com",
    },
  });
}

/**
 * Persists a PUBLISHED {@link Project} with the given title/slug.
 *
 * @param prisma - client bound to the test database.
 * @param o - title and slug (required), optional project type.
 * @returns the created project row.
 */
export function createProject(
  prisma: PrismaClient,
  o: { title: string; slug: string } & Partial<{ type: ProjectType }>,
) {
  return prisma.project.create({
    data: {
      title: o.title,
      slug: o.slug,
      summary: "s",
      content: "c",
      status: "PUBLISHED",
      type: o.type ?? "SOFTWARE",
    },
  });
}

type ExperienceTier = "FEATURED" | "PREVIOUS" | "MINI";

/**
 * Persists a minimal {@link Experience} (CV corpus) with sane defaults.
 *
 * @param prisma - client bound to the test database.
 * @param o - optional field overrides.
 * @returns the created experience row.
 */
export function createExperience(
  prisma: PrismaClient,
  o: Partial<{
    title: string;
    company: string;
    tier: ExperienceTier;
    startDate: Date;
    showOnPdf: boolean;
    showOnCvPage: boolean;
    bullets: string[];
    stack: string[];
  }> = {},
) {
  return prisma.experience.create({
    data: {
      title: o.title ?? "Lead technique",
      company: o.company ?? "Acme",
      startDate: o.startDate ?? new Date("2023-01-01"),
      tier: o.tier ?? "MINI",
      bullets: o.bullets ?? [],
      stack: o.stack ?? [],
      showOnPdf: o.showOnPdf ?? false,
      showOnCvPage: o.showOnCvPage ?? true,
    },
  });
}

/**
 * Persists a minimal {@link Education} (CV corpus) with sane defaults.
 *
 * @param prisma - client bound to the test database.
 * @param o - optional field overrides.
 * @returns the created education row.
 */
export function createEducation(
  prisma: PrismaClient,
  o: Partial<{ title: string; date: string; details: string[] }> = {},
) {
  return prisma.education.create({
    data: {
      title: o.title ?? "Master informatique",
      date: o.date ?? "2018 — 2020",
      details: o.details ?? [],
    },
  });
}

/**
 * Persists a minimal {@link Language} (CV sidebar) with sane defaults.
 *
 * @param prisma - client bound to the test database.
 * @param o - optional field overrides.
 * @returns the created language row.
 */
export function createLanguage(
  prisma: PrismaClient,
  o: Partial<{ name: string; level: string }> = {},
) {
  return prisma.language.create({
    data: { name: o.name ?? "Français", level: o.level ?? "Langue maternelle" },
  });
}

/**
 * Persists a minimal {@link Interest} (CV sidebar) with sane defaults.
 *
 * @param prisma - client bound to the test database.
 * @param o - optional field overrides.
 * @returns the created interest row.
 */
export function createInterest(prisma: PrismaClient, o: Partial<{ label: string }> = {}) {
  return prisma.interest.create({ data: { label: o.label ?? "Course à pied" } });
}
