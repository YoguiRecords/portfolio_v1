import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { addBlockAction, deleteBlockAction } from "@/lib/actions/block-actions";
import { updateProjectAction } from "@/lib/actions/project-actions";
import { ProjectEditor, type ProjectEditorData } from "@/components/projects/project-editor";
import { ProcessEditor } from "@/components/block-editors/process-editor";
import { ContextEditor } from "@/components/block-editors/context-editor";
import { TextEditor } from "@/components/block-editors/text-editor";
import { ResultsEditor } from "@/components/block-editors/results-editor";
import { JsonEditor } from "@/components/block-editors/json-editor";

export const dynamic = "force-dynamic";

const BLOCK_TYPES = [
  "CONTEXT",
  "PROCESS",
  "GAME_DESIGN",
  "ARCHITECTURE",
  "SECURITY",
  "DESIGN_UX",
  "METRICS",
  "ANALYSIS",
  "RECOMMENDATIONS",
  "RESULTS",
  "TEXT",
  "GALLERY",
] as const;

/** Renders the right editor for a block type (dedicated where available, else JSON). */
function BlockEditor({ block, projectId }: { block: { id: string; type: string; data: unknown }; projectId: string }) {
  const data = (block.data ?? {}) as Record<string, unknown>;
  switch (block.type) {
    case "PROCESS":
      return <ProcessEditor blockId={block.id} projectId={projectId} initial={(data.phases as never[]) ?? []} />;
    case "CONTEXT":
      return <ContextEditor blockId={block.id} projectId={projectId} initial={data} />;
    case "TEXT":
      return <TextEditor blockId={block.id} projectId={projectId} initial={data} />;
    case "RESULTS":
      return <ResultsEditor blockId={block.id} projectId={projectId} initial={data} />;
    default:
      return <JsonEditor blockId={block.id} projectId={projectId} initial={data} />;
  }
}

/** Project editor v2: header form + live preview, then flexible block editors. */
export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  const editorData: ProjectEditorData = {
    id: project.id,
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    tagline: project.tagline ?? "",
    role: project.role ?? "",
    type: project.type,
    statusLabel: project.statusLabel ?? "",
    status: project.status,
    featured: project.featured,
    showOnCv: project.showOnCv,
    cvBadge: project.cvBadge,
  };

  return (
    <PageContainer width="editor" gap={8}>
      <div>
        <Link href="/projets" className="font-mono text-xs text-muted hover:text-accent">
          ← Projets
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-ink">{project.title}</h1>
      </div>

      <ProjectEditor project={editorData} action={updateProjectAction} />

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">Blocs de la fiche</h2>
        {project.blocks.length === 0 ? (
          <p className="text-sm text-muted">Aucun bloc. Ajoutez-en un ci-dessous.</p>
        ) : (
          project.blocks.map((block) => (
            <section key={block.id} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wide text-accent">{block.type}</span>
                <form action={deleteBlockAction.bind(null, block.id, project.id)}>
                  <ConfirmSubmitButton label="Supprimer le bloc" />
                </form>
              </div>
              <BlockEditor block={block} projectId={project.id} />
            </section>
          ))
        )}

        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-ink-2">Ajouter un bloc</h3>
          <div className="flex flex-wrap gap-2">
            {BLOCK_TYPES.map((t) => (
              <form key={t} action={addBlockAction.bind(null, project.id, t)}>
                <button type="submit" className="rounded-control border border-border px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2">
                  + {t}
                </button>
              </form>
            ))}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
