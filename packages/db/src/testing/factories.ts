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
