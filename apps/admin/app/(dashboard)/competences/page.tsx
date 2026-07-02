import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { listSkills } from "@/lib/content/skill";
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";
const KINDS = ["TECH", "SOFT"] as const;

/** Skills editor (orbit nodes on the home ecosystem + CV competences/soft skills). */
export default async function SkillsPage() {
  await requirePermission("skills");
  const skills = await listSkills(prisma);

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Compétences</h1>
      <p className="text-sm text-muted">
        <code>kind</code> distingue compétences (TECH) et soft skills (SOFT) ; la catégorie regroupe
        les TECH sur le CV ; « CV » projette la compétence sur le CV.
      </p>

      <div className="grid items-start gap-6 xl:grid-cols-[2fr_1fr]">
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {skills.length === 0 ? (
            <li className="p-4 text-sm text-muted">Aucune compétence.</li>
          ) : (
            skills.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-2 p-3">
                <form action={updateSkillAction} className="flex flex-1 flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="order" value={s.order} />
                  <input className={`${inputCls} flex-1`} name="name" defaultValue={s.name} required />
                  <input
                    className={`${inputCls} w-40`}
                    name="category"
                    defaultValue={s.category ?? ""}
                    placeholder="Catégorie"
                  />
                  <select className={inputCls} name="kind" defaultValue={s.kind}>
                    {KINDS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    <input type="checkbox" name="showOnCv" defaultChecked={s.showOnCv} /> CV
                  </label>
                  <button
                    type="submit"
                    className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
                  >
                    Enregistrer
                  </button>
                </form>
                <form action={deleteSkillAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmSubmitButton label="✕" />
                </form>
              </li>
            ))
          )}
        </ul>

        <form
          action={createSkillAction}
          className="flex flex-col gap-3 rounded-lg border border-border p-4 xl:sticky xl:top-6"
        >
          <h2 className="text-sm font-semibold text-ink-2">Ajouter une compétence</h2>
          <input className={inputCls} name="name" placeholder="Nom (ex. Full-stack)" required />
          <input className={inputCls} name="category" placeholder="Catégorie (optionnel)" />
          <select className={inputCls} name="kind" defaultValue="TECH">
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" name="showOnCv" /> Afficher sur le CV
          </label>
          <input className={inputCls} name="order" type="number" defaultValue={skills.length} placeholder="Ordre" />
          <button
            type="submit"
            className="self-start rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
          >
            Ajouter
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
