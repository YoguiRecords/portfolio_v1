import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { TestimonialCard } from "./testimonial-card";
import type { ApprovedTestimonial } from "../../lib/data/testimonials";

const testimonial = {
  id: "t1",
  authorName: "Une cliente",
  authorRole: "Dirigeante",
  content: "Un accompagnement remarquable.",
  rating: 5,
  isFeatured: true,
  avatar: null,
} as unknown as ApprovedTestimonial;

test("affiche le nom, le rôle, le contenu et la note", () => {
  render(<TestimonialCard testimonial={testimonial} />);
  expect(screen.getByText("Une cliente")).toBeInTheDocument();
  expect(screen.getByText(/Dirigeante/)).toBeInTheDocument();
  expect(screen.getByText("Un accompagnement remarquable.")).toBeInTheDocument();
  expect(screen.getByLabelText("Note : 5 sur 5")).toBeInTheDocument();
});
