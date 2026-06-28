import { z } from "zod";

/**
 * Validation schema for a public testimonial submission. Unknown keys (notably
 * any `status`) are stripped by Zod, so the public cannot self-approve — the row
 * always lands as PENDING for back-office moderation.
 */
export const TestimonialInput = z.object({
  authorName: z.string().min(1).max(80),
  authorRole: z.string().max(80).optional(),
  authorEmail: z.string().email().max(120).optional(),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
});

export type TestimonialInput = z.infer<typeof TestimonialInput>;
