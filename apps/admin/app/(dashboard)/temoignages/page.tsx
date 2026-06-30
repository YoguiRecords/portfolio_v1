import { prisma } from "@portfolio/db";
import { TESTIMONIAL_RELATIONSHIPS } from "@portfolio/core";
import { PageContainer } from "@/components/ui";
import { listTestimonials } from "@/lib/content/moderation";
import {
  approveTestimonialAction,
  editTestimonialAction,
  featureTestimonialAction,
  rejectTestimonialAction,
} from "@/lib/actions/moderation-actions";
import { TestimonialsList, type TestimonialRow } from "@/components/testimonials/testimonials-list";

export const dynamic = "force-dynamic";

/** Testimonial moderation v2: status tabs, edit displayed text, feature, confirmed reject. */
export default async function ModerationPage() {
  const items = await listTestimonials(prisma);
  const rows: TestimonialRow[] = items.map((t) => ({
    id: t.id,
    authorName: t.authorName,
    authorRole: t.authorRole,
    authorCompany: t.authorCompany,
    relationshipLabel: t.authorRelationship ? TESTIMONIAL_RELATIONSHIPS[t.authorRelationship] : null,
    status: t.status,
    content: t.content,
    submittedContent: t.submittedContent,
    isFeatured: t.isFeatured,
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-bold text-ink">Modération des témoignages</h1>
      <TestimonialsList
        items={rows}
        actions={{
          approve: approveTestimonialAction,
          reject: rejectTestimonialAction,
          edit: editTestimonialAction,
          feature: featureTestimonialAction,
        }}
      />
    </PageContainer>
  );
}
