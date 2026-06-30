import type { PrismaClient } from "@portfolio/db";
import {
  ExperienceInput,
  ExperienceUpdate,
  EducationInput,
  EducationUpdate,
  LanguageInput,
  LanguageUpdate,
  InterestInput,
  InterestUpdate,
} from "@portfolio/core";

/**
 * CV corpus persistence (write side, `app_admin`): experiences, education,
 * languages and interests. All validated with Zod, injectable for tests.
 * Reorder persists a new explicit order from a drag-and-drop ordered id list.
 */

// ── Experiences ──

/** Lists experiences ordered for the editor. */
export function listExperiences(prisma: PrismaClient) {
  return prisma.experience.findMany({ orderBy: { order: "asc" } });
}

/** Creates an experience from validated input. */
export async function createExperience(prisma: PrismaClient, raw: unknown) {
  const data = ExperienceInput.parse(raw);
  return prisma.experience.create({ data });
}

/** Updates an experience from validated input. */
export async function updateExperience(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = ExperienceUpdate.parse(raw);
  return prisma.experience.update({ where: { id }, data });
}

/** Deletes an experience by id. */
export async function deleteExperience(prisma: PrismaClient, id: string) {
  await prisma.experience.delete({ where: { id } });
}

/** Reorders experiences: assigns `order = index` following the given id list. */
export async function reorderExperiences(prisma: PrismaClient, ids: string[]) {
  await prisma.$transaction(
    ids.map((id, i) => prisma.experience.update({ where: { id }, data: { order: i } })),
  );
}

// ── Education ──

/** Lists education entries ordered for the editor. */
export function listEducation(prisma: PrismaClient) {
  return prisma.education.findMany({ orderBy: { order: "asc" } });
}

/** Creates an education entry from validated input. */
export async function createEducation(prisma: PrismaClient, raw: unknown) {
  const data = EducationInput.parse(raw);
  return prisma.education.create({ data });
}

/** Updates an education entry from validated input. */
export async function updateEducation(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = EducationUpdate.parse(raw);
  return prisma.education.update({ where: { id }, data });
}

/** Deletes an education entry by id. */
export async function deleteEducation(prisma: PrismaClient, id: string) {
  await prisma.education.delete({ where: { id } });
}

/** Reorders education entries from the given id list. */
export async function reorderEducation(prisma: PrismaClient, ids: string[]) {
  await prisma.$transaction(
    ids.map((id, i) => prisma.education.update({ where: { id }, data: { order: i } })),
  );
}

// ── Languages ──

/** Lists languages ordered for the editor. */
export function listLanguages(prisma: PrismaClient) {
  return prisma.language.findMany({ orderBy: { order: "asc" } });
}

/** Creates a language from validated input. */
export async function createLanguage(prisma: PrismaClient, raw: unknown) {
  const data = LanguageInput.parse(raw);
  return prisma.language.create({ data });
}

/** Updates a language from validated input. */
export async function updateLanguage(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = LanguageUpdate.parse(raw);
  return prisma.language.update({ where: { id }, data });
}

/** Deletes a language by id. */
export async function deleteLanguage(prisma: PrismaClient, id: string) {
  await prisma.language.delete({ where: { id } });
}

/** Reorders languages from the given id list. */
export async function reorderLanguages(prisma: PrismaClient, ids: string[]) {
  await prisma.$transaction(
    ids.map((id, i) => prisma.language.update({ where: { id }, data: { order: i } })),
  );
}

// ── Interests ──

/** Lists interests ordered for the editor. */
export function listInterests(prisma: PrismaClient) {
  return prisma.interest.findMany({ orderBy: { order: "asc" } });
}

/** Creates an interest from validated input. */
export async function createInterest(prisma: PrismaClient, raw: unknown) {
  const data = InterestInput.parse(raw);
  return prisma.interest.create({ data });
}

/** Updates an interest from validated input. */
export async function updateInterest(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = InterestUpdate.parse(raw);
  return prisma.interest.update({ where: { id }, data });
}

/** Deletes an interest by id. */
export async function deleteInterest(prisma: PrismaClient, id: string) {
  await prisma.interest.delete({ where: { id } });
}

/** Reorders interests from the given id list. */
export async function reorderInterests(prisma: PrismaClient, ids: string[]) {
  await prisma.$transaction(
    ids.map((id, i) => prisma.interest.update({ where: { id }, data: { order: i } })),
  );
}
