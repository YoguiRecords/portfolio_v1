import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject } from "../../../lib/data/project";
import { ProjectHero } from "../../../components/sections/project-hero";
import { BlockRenderer } from "../../../components/blocks/block-renderer";
import { ProjectNext } from "../../../components/project-next/project-next";

// Rendered per request from the DB (no build-time DB dependency).
export const dynamic = "force-dynamic";

/** Builds SEO metadata from the project's SEO fields (falls back to summary). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProject(slug);
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProject(slug);
  if (!data) notFound();

  const { project, next } = data;
  const images = project.images.map((pi) => ({ url: pi.image.url, alt: pi.image.alt }));

  return (
    <main>
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
