import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { addBlockAction, deleteBlockAction } from "@/lib/actions/block-actions";
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

/** Project block editor: add/remove blocks and edit the Gantt (PROCESS) visually. */
export default async function ProjectBlocksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!project) notFound();

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <div>
        <Link href="/projets" className="font-mono text-xs text-zinc-500 hover:text-amber-400">
          ← Projets
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-50">Blocs — {project.title}</h1>
      </div>

      {project.blocks.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun bloc. Ajoutez-en un ci-dessous.</p>
      ) : (
        project.blocks.map((block) => (
          <section key={block.id} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wide text-amber-400">{block.type}</span>
              <form action={deleteBlockAction.bind(null, block.id, project.id)}>
                <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1 text-sm text-zinc-400 hover:bg-zinc-800">
                  Supprimer le bloc
                </button>
              </form>
            </div>
            <BlockEditor block={block} projectId={project.id} />
          </section>
        ))
      )}

      <div className="flex flex-col gap-2 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Ajouter un bloc</h2>
        <div className="flex flex-wrap gap-2">
          {BLOCK_TYPES.map((t) => (
            <form key={t} action={addBlockAction.bind(null, project.id, t)}>
              <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                + {t}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
