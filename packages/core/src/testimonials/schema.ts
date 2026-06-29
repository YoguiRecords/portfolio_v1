import { z } from "zod";

/**
 * Hierarchical relationship between the testimonial author and Yohan.
 * Labels (FR) are shared by the public form and the display so they stay in sync.
 */
export const TESTIMONIAL_RELATIONSHIPS = {
  MANAGER: "A été mon manager",
  PEER: "Collègue / pair",
  REPORT: "A été sous ma responsabilité",
  CLIENT: "Client",
  PARTNER: "Partenaire / prestataire",
  TEACHER: "Professeur / formateur",
  STUDENT: "Élève / apprenant",
  OTHER: "Autre",
} as const;

export type TestimonialRelationship = keyof typeof TESTIMONIAL_RELATIONSHIPS;

const RELATIONSHIP_KEYS = Object.keys(TESTIMONIAL_RELATIONSHIPS) as [
  TestimonialRelationship,
  ...TestimonialRelationship[],
];

/**
 * Validation schema for a public testimonial submission. Unknown keys (notably
 * any `status`) are stripped by Zod, so the public cannot self-approve — the row
 * always lands as PENDING for back-office moderation.
 */
export const TestimonialInput = z.object({
  authorName: z.string().min(1).max(80),
  authorRole: z.string().max(80).optional(),
  authorCompany: z.string().max(120).optional(),
  authorRelationship: z.enum(RELATIONSHIP_KEYS).optional(),
  authorEmail: z.string().email().max(120).optional(),
  content: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).optional(),
});

export type TestimonialInput = z.infer<typeof TestimonialInput>;
