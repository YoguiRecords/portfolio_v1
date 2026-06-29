import { TESTIMONIAL_RELATIONSHIPS } from "@portfolio/core";
import type { ApprovedTestimonial } from "../../lib/data/testimonials";
import styles from "./testimonial-card.module.css";

/** Composes the "role · company" subtitle from the available fields. */
function subtitle(role: string | null, company: string | null): string | null {
  if (role && company) return `${role} · ${company}`;
  return role ?? company ?? null;
}

/** Renders the star rating (1–5) or nothing when absent. */
function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  const clamped = Math.max(1, Math.min(5, rating));
  return (
    <div className={styles.stars} aria-label={`Note : ${clamped} sur 5`}>
      {"★".repeat(clamped)}
      {"☆".repeat(5 - clamped)}
    </div>
  );
}

/** A single approved testimonial (display-only columns). */
export function TestimonialCard({ testimonial }: { testimonial: ApprovedTestimonial }) {
  return (
    <figure className={styles.card}>
      <Stars rating={testimonial.rating} />
      <blockquote className={styles.content}>{testimonial.content}</blockquote>
      <figcaption className={styles.author}>
        {testimonial.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- external MinIO URL
          <img className={styles.avatar} src={testimonial.avatar.url} alt={testimonial.authorName} />
        ) : null}
        <span>
          <span className={styles.name}>{testimonial.authorName}</span>
          {subtitle(testimonial.authorRole, testimonial.authorCompany) ? (
            <span className={styles.role}> · {subtitle(testimonial.authorRole, testimonial.authorCompany)}</span>
          ) : null}
          {testimonial.authorRelationship ? (
            <span className={styles.relationship}>
              {TESTIMONIAL_RELATIONSHIPS[testimonial.authorRelationship]}
            </span>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
