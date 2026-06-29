import { cache } from "react";
import { prisma as sharedPrisma, type PrismaClient } from "@portfolio/db";

/**
 * Lists APPROVED testimonials for public display, featured first.
 *
 * The `select` exposes **only** display columns — never `authorEmail`, `ip`,
 * `userAgent` or `submittedContent` — matching the least-privilege grant given
 * to the `app_web` role.
 *
 * @param prisma - Prisma client (injected for tests).
 */
export async function listApprovedTestimonials(prisma: PrismaClient) {
  return prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
    select: {
      id: true,
      authorName: true,
      authorRole: true,
      authorCompany: true,
      authorRelationship: true,
      content: true,
      rating: true,
      isFeatured: true,
      avatar: { select: { url: true, alt: true } },
    },
  });
}

export type ApprovedTestimonial = Awaited<ReturnType<typeof listApprovedTestimonials>>[number];

/** Request-cached loader bound to the shared client (used by pages). */
export const getApprovedTestimonials = cache(() => listApprovedTestimonials(sharedPrisma));
