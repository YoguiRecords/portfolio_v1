import Link from "next/link";
import { prisma } from "@portfolio/db";
import { listProjects } from "@/lib/content/project";
import {
  createProjectAction,
  setProjectStatusAction,
  deleteProjectAction,
} from "@/lib/actions/project-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Project editor — header CRUD (blocks edited per type, validated by Zod). */
export default async function ProjectsPage() {
  const projects = await listProjects(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Projets</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {projects.length === 0 ? (
          <li className="p-4 text-sm text-zinc-500">Aucun projet.</li>
        ) : (
          projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-semibold text-zinc-100">{p.title}</div>
                <div className="text-xs text-zinc-500">
                  {p.slug} · {p.type} · {p.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/projets/${p.id}`}
                  className="rounded-md border border-amber-500/40 px-3 py-1.5 text-sm text-amber-300 hover:bg-amber-500/10"
                >
                  Éditer les blocs
                </Link>
                <form action={setProjectStatusAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="status" value={p.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED"} />
                  <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                    {p.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                  </button>
                </form>
                <form action={deleteProjectAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                    Supprimer
                  </button>
                </form>
              </div>
            </li>
          ))
        )}
      </ul>

      <form action={createProjectAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Nouveau projet</h2>
        <input className={inputCls} name="title" placeholder="Titre" required />
        <input className={inputCls} name="slug" placeholder="slug-du-projet" required />
        <input className={inputCls} name="summary" placeholder="Résumé" required />
        <select className={inputCls} name="type" defaultValue="SOFTWARE">
          <option value="GAME">Jeu</option>
          <option value="SOFTWARE">Logiciel</option>
          <option value="WEBSITE">Site web</option>
          <option value="BUSINESS">Business</option>
        </select>
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Créer
        </button>
      </form>
    </div>
  );
}
