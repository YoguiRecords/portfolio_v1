import type { PrismaClient } from "@portfolio/db";
import type { TestimonialInput } from "@portfolio/core";

/** Request metadata captured for audit/anti-abuse (never displayed publicly). */
export interface SubmitMeta {
  ip: string | null;
  userAgent: string | null;
}

/**
 * Persists a public testimonial submission as PENDING.
 *
 * `status` is never set here (it defaults to PENDING) — the public cannot
 * self-approve. `submittedContent` keeps the original text for audit; `content`
 * is the (initially identical) display text the admin may later edit.
 *
 * @param prisma - a client with INSERT permission on Testimonial (`app_web`).
 * @param input - the validated submission.
 * @param meta - request metadata (ip, user agent).
 */
export async function persistTestimonial(
  prisma: PrismaClient,
  input: TestimonialInput,
  meta: SubmitMeta,
): Promise<void> {
  await prisma.testimonial.create({
    data: {
      authorName: input.authorName,
      authorRole: input.authorRole,
      authorCompany: input.authorCompany,
      authorRelationship: input.authorRelationship,
      authorEmail: input.authorEmail,
      content: input.content,
      submittedContent: input.content,
      rating: input.rating,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
}
