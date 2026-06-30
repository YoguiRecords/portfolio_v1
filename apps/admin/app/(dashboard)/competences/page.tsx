import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton } from "@/components/ui";
import { listSkills } from "@/lib/content/skill";
import { createSkillAction, deleteSkillAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** Skills editor (orbit nodes on the home ecosystem). */
export default async function SkillsPage() {
  const skills = await listSkills(prisma);

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-ink">Compétences</h1>

      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {skills.length === 0 ? (
          <li className="p-4 text-sm text-muted">Aucune compétence.</li>
        ) : (
          skills.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <span className="text-sm font-semibold text-ink">{s.name}</span>
                {s.category ? <span className="ml-2 text-xs text-muted">{s.category}</span> : null}
              </div>
              <form action={deleteSkillAction}>
                <input type="hidden" name="id" value={s.id} />
                <ConfirmSubmitButton label="Supprimer" />
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createSkillAction} className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <h2 className="text-sm font-semibold text-ink-2">Ajouter une compétence</h2>
        <input className={inputCls} name="name" placeholder="Nom (ex. Full-stack)" required />
        <input className={inputCls} name="category" placeholder="Catégorie (optionnel)" />
        <input className={inputCls} name="order" type="number" defaultValue={skills.length} placeholder="Ordre" />
        <button type="submit" className="self-start rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong">
          Ajouter
        </button>
      </form>
    </div>
  );
}
