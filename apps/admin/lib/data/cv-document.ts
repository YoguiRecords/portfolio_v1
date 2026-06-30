import type { PrismaClient } from "@portfolio/db";
import { overlayMany, overlayOne } from "@/lib/i18n/overlay";

/**
 * Loads the CV corpus projected for the **PDF document** (the A4 `CvDocument`):
 * only records flagged for the PDF / CV, ordered, with the EN translation
 * overlay applied to scalar text fields (array fields stay FR for now).
 *
 * @param prisma - admin (`app_admin`) client (injectable for tests).
 * @param locale - "fr" (base) or "en" (overlay).
 */
export async function loadCvDocument(prisma: PrismaClient, locale: string) {
  const [profileRaw, experiencesRaw, educationRaw, skills, projectsRaw, kpis, languages, interests] =
    await Promise.all([
      prisma.profile.findFirst(),
      prisma.experience.findMany({ where: { showOnPdf: true }, orderBy: { order: "asc" } }),
      prisma.education.findMany({ where: { showOnPdf: true }, orderBy: { order: "asc" } }),
      prisma.skill.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
      prisma.project.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
      prisma.kpi.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
      prisma.language.findMany({ orderBy: { order: "asc" } }),
      prisma.interest.findMany({ orderBy: { order: "asc" } }),
    ]);

  const profile = await overlayOne(prisma, locale, "Profile", profileRaw, [
    "headline",
    "bio",
    "cvAccroche",
    "availabilityLabel",
    "currentRole",
  ]);
  const experiences = await overlayMany(prisma, locale, "Experience", experiencesRaw, [
    "title",
    "company",
    "description",
  ]);
  const education = await overlayMany(prisma, locale, "Education", educationRaw, ["title", "institution"]);
  const projects = await overlayMany(prisma, locale, "Project", projectsRaw, ["title", "summary"]);

  return {
    locale,
    profile,
    experiences,
    education,
    skills: skills.filter((s) => s.kind === "TECH"),
    softSkills: skills.filter((s) => s.kind === "SOFT"),
    projects,
    kpis,
    languages,
    interests,
  };
}

/** Shape returned by {@link loadCvDocument}, consumed by `CvDocument`. */
export type CvDocumentData = Awaited<ReturnType<typeof loadCvDocument>>;
