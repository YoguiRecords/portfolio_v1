import { prisma } from "@portfolio/db";
import { listSkills } from "@/lib/content/skill";
import { createSkillAction, deleteSkillAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Skills editor (orbit nodes on the home ecosystem). */
export default async function SkillsPage() {
  const skills = await listSkills(prisma);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Compétences</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {skills.length === 0 ? (
          <li className="p-4 text-sm text-zinc-500">Aucune compétence.</li>
        ) : (
          skills.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <span className="text-sm font-semibold text-zinc-100">{s.name}</span>
                {s.category ? <span className="ml-2 text-xs text-zinc-500">{s.category}</span> : null}
              </div>
              <form action={deleteSkillAction}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800">
                  Supprimer
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createSkillAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Ajouter une compétence</h2>
        <input className={inputCls} name="name" placeholder="Nom (ex. Full-stack)" required />
        <input className={inputCls} name="category" placeholder="Catégorie (optionnel)" />
        <input className={inputCls} name="order" type="number" defaultValue={skills.length} placeholder="Ordre" />
        <button type="submit" className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600">
          Ajouter
        </button>
      </form>
    </div>
  );
}
