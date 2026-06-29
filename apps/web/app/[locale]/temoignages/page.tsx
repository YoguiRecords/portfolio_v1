import type { Metadata } from "next";
import { getApprovedTestimonials } from "../../../lib/data/testimonials";
import { TestimonialCard } from "../../../components/testimonial-card/testimonial-card";
import { TestimonialForm } from "../../../components/testimonial-form/testimonial-form";
import feedStyles from "../../../components/feed/feed.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Témoignages",
  description: "Ce qu'ils disent du travail livré — et votre retour.",
};

export default async function TestimonialsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const testimonials = await getApprovedTestimonials(locale);
  return (
    <main className="chapter">
      <div className="wrap">
        <div className="marker">Témoignages</div>
        <h2>Ce qu&apos;ils en disent.</h2>

        {testimonials.length > 0 ? (
          <div className={feedStyles.list} style={{ marginBottom: 56 }}>
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        ) : (
          <p className="txt">Soyez le premier à laisser un témoignage.</p>
        )}

        <h3 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 20px" }}>
          Laisser un témoignage
        </h3>
        <TestimonialForm />
      </div>
    </main>
  );
}
