import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "../../../../lib/data/project";
import { ProjectHero } from "../../../../components/sections/project-hero";
import { BlockRenderer } from "../../../../components/blocks/block-renderer";
import { ProjectNext } from "../../../../components/project-next/project-next";
import { JsonLd } from "../../../../components/json-ld/json-ld";
import { creativeWorkJsonLd, faqPageJsonLd } from "../../../../lib/seo/jsonld";
import { localizedUrl } from "../../../../lib/seo/url";

// Rendered per request from the DB (no build-time DB dependency).
export const dynamic = "force-dynamic";

/** Builds SEO metadata from the project's SEO fields (falls back to summary). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const data = await getProject(slug, locale);
  if (!data) return { title: "Projet introuvable" };
  const { project } = data;
  return {
    title: project.seoTitle ?? project.title,
    description: project.seoDescription ?? project.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale } = await params;
  const data = await getProject(slug, locale);
  if (!data) notFound();

  const { project, next } = data;
  const images = project.images.map((pi) => ({ url: pi.image.url, alt: pi.image.alt }));
  const loc = locale === "en" ? "en" : "fr";
  const work = creativeWorkJsonLd({
    name: project.title,
    description: project.seoDescription ?? project.summary,
    url: localizedUrl(`/projets/${project.slug}`, loc),
    author: "Yohan Debusscher",
  });
  const faq = project.faqs.length
    ? faqPageJsonLd(project.faqs.map((f) => ({ question: f.question, answer: f.answer })))
    : null;

  return (
    <main>
      <JsonLd data={work} />
      {faq ? <JsonLd data={faq} /> : null}
      <ProjectHero project={project} />
      <div className="wrap">
        <BlockRenderer blocks={project.blocks} images={images} />
      </div>
      <div className="wrap">
        <ProjectNext next={next} />
      </div>
    </main>
  );
}
