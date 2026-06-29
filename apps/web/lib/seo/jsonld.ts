/**
 * Pure Schema.org JSON-LD builders. They return plain objects (serialized into a
 * `<script type="application/ld+json">` by the `<JsonLd>` module), so they are
 * trivially unit-testable and carry no rendering concerns.
 */

const CONTEXT = "https://schema.org" as const;

/** Person (home / profile). */
export function personJsonLd(p: {
  name: string;
  jobTitle?: string;
  description?: string;
  url: string;
  sameAs?: string[];
}) {
  return {
    "@context": CONTEXT,
    "@type": "Person",
    name: p.name,
    ...(p.jobTitle ? { jobTitle: p.jobTitle } : {}),
    ...(p.description ? { description: p.description } : {}),
    url: p.url,
    ...(p.sameAs && p.sameAs.length ? { sameAs: p.sameAs } : {}),
  };
}

/** CreativeWork (project case study). */
export function creativeWorkJsonLd(p: {
  name: string;
  description: string;
  url: string;
  author: string;
}) {
  return {
    "@context": CONTEXT,
    "@type": "CreativeWork",
    name: p.name,
    description: p.description,
    url: p.url,
    author: { "@type": "Person", name: p.author },
  };
}

/** Article (news). */
export function articleJsonLd(p: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  author: string;
}) {
  return {
    "@context": CONTEXT,
    "@type": "Article",
    headline: p.headline,
    description: p.description,
    url: p.url,
    ...(p.datePublished ? { datePublished: p.datePublished } : {}),
    author: { "@type": "Person", name: p.author },
  };
}

/** Event (agenda). */
export function eventJsonLd(p: {
  name: string;
  startDate: string;
  endDate?: string;
  url: string;
  locationName?: string;
  isOnline?: boolean;
}) {
  return {
    "@context": CONTEXT,
    "@type": "Event",
    name: p.name,
    startDate: p.startDate,
    ...(p.endDate ? { endDate: p.endDate } : {}),
    url: p.url,
    eventAttendanceMode: p.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(p.locationName
      ? { location: { "@type": "Place", name: p.locationName } }
      : {}),
  };
}

/** FAQPage (rich snippet + AEO). */
export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/** BreadcrumbList. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
