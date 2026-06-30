import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";
import { overlayMany, overlayOne } from "./overlay";

/**
 * Loads the public CV page corpus (read-only `app_web`). The page is the RICH
 * projection: all records flagged `showOnCvPage` / `showOnCv` (more than the
 * 1-page PDF), with the EN overlay applied to scalar text fields. Also returns
 * the frozen PDF URLs (one per locale) for the download buttons.
 *
 * @param prisma - injected client (tests use the test DB).
 * @param locale - active locale; non-FR applies the EN overlay (FR fallback).
 */
export async function getCvData(prisma: PrismaClient, locale = "fr") {
  const [profile, experiences, education, skills, projects, kpis, languages, interests, cvExports] =
    await Promise.all([
      prisma.profile.findFirst({ include: { avatar: true } }),
      prisma.experience.findMany({ where: { showOnCvPage: true }, orderBy: { order: "asc" } }),
      prisma.education.findMany({ where: { showOnCvPage: true }, orderBy: { order: "asc" } }),
      prisma.skill.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
      prisma.project.findMany({
        where: { showOnCv: true, status: "PUBLISHED" },
        orderBy: { order: "asc" },
      }),
      prisma.kpi.findMany({ where: { showOnCv: true }, orderBy: { order: "asc" } }),
      prisma.language.findMany({ orderBy: { order: "asc" } }),
      prisma.interest.findMany({ orderBy: { order: "asc" } }),
      prisma.cvExport.findMany(),
    ]);

  const [localizedProfile, localizedExp, localizedEdu, localizedProj] = await Promise.all([
    overlayOne(prisma, locale, "Profile", profile, [
      "headline",
      "bio",
      "cvAccroche",
      "currentRole",
      "availabilityLabel",
    ]),
    overlayMany(prisma, locale, "Experience", experiences, ["title", "company", "description"]),
    overlayMany(prisma, locale, "Education", education, ["title", "institution"]),
    overlayMany(prisma, locale, "Project", projects, ["title", "summary"]),
  ]);

  return {
    locale,
    profile: localizedProfile,
    experiences: localizedExp,
    education: localizedEdu,
    skills: skills.filter((s) => s.kind === "TECH"),
    softSkills: skills.filter((s) => s.kind === "SOFT"),
    projects: localizedProj,
    kpis,
    languages,
    interests,
    /** Frozen PDF URL per locale, e.g. `{ fr: "https://…/cv-fr.pdf" }`. */
    pdfs: Object.fromEntries(cvExports.map((e) => [e.locale, e.url])) as Record<string, string>,
  };
}

/** The CV page payload type, derived from the loader. */
export type CvData = Awaited<ReturnType<typeof getCvData>>;

/** Request-cached CV loader bound to the shared client (used by page + metadata). */
export const getCv = cache((locale: string) => getCvData(sharedPrisma, locale));
