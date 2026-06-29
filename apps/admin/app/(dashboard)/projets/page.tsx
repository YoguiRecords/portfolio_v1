import { prisma } from "@portfolio/db";
import { listProjects } from "@/lib/content/project";
import {
  createProjectAction,
  deleteProjectAction,
  setProjectStatusAction,
} from "@/lib/actions/project-actions";
import { ProjectsList, type ProjectRow } from "@/components/projects/projects-list";

export const dynamic = "force-dynamic";

/** Liste Projets v2 (DataTable CRUD : recherche, filtres, pagination, suppression confirmée). */
export default async function ProjectsPage() {
  const projects = await listProjects(prisma);
  const rows: ProjectRow[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    type: p.type,
    status: p.status,
    featured: p.featured,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Projets</h1>
      <ProjectsList
        projects={rows}
        actions={{ create: createProjectAction, setStatus: setProjectStatusAction, remove: deleteProjectAction }}
      />
    </div>
  );
}
