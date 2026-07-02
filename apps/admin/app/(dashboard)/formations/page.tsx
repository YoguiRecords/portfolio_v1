import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { SortableList } from "@/components/ui/sortable-list";
import { listEducation } from "@/lib/content/cv-corpus";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction,
  reorderEducationAction,
} from "@/lib/actions/cv-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** CV editor — education entries (drag to reorder, inline edit, delete). */
export default async function FormationsPage() {
  await requirePermission("content");
  const items = await listEducation(prisma);

  const rows = items.map((ed) => ({
    id: ed.id,
    content: (
      <div className="flex flex-col gap-2">
        <form action={updateEducationAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={ed.id} />
          <input type="hidden" name="order" value={ed.order} />
          <div className="flex flex-wrap gap-2">
            <input className={`${input} flex-1`} name="title" defaultValue={ed.title} placeholder="Diplôme / titre" required />
            <input className={`${input} flex-1`} name="institution" defaultValue={ed.institution ?? ""} placeholder="Établissement" />
            <input className={`${input} w-40`} name="date" defaultValue={ed.date} placeholder="2018 — 2020" required />
          </div>
          <textarea
            className={input}
            name="details"
            rows={2}
            defaultValue={ed.details.join("\n")}
            placeholder="Détails (une ligne par item)"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <label className="flex items-center gap-1">
              <input type="checkbox" name="showOnPdf" defaultChecked={ed.showOnPdf} /> PDF
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" name="showOnCvPage" defaultChecked={ed.showOnCvPage} /> Page /cv
            </label>
            <button
              type="submit"
              className="ml-auto rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
            >
              Enregistrer
            </button>
          </div>
        </form>
        <form action={deleteEducationAction} className="self-end">
          <input type="hidden" name="id" value={ed.id} />
          <ConfirmSubmitButton label="Supprimer" />
        </form>
      </div>
    ),
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Formations (CV)</h1>
      <p className="text-sm text-muted">Glissez la poignée ⠿ pour réordonner.</p>

      <SortableList items={rows} reorderAction={reorderEducationAction} />

      <form
        action={createEducationAction}
        className="flex flex-col gap-2 rounded-lg border border-dashed border-border-strong p-4"
      >
        <h2 className="text-sm font-semibold text-ink-2">Ajouter une formation</h2>
        <div className="flex flex-wrap gap-2">
          <input className={`${input} flex-1`} name="title" placeholder="Diplôme / titre" required />
          <input className={`${input} flex-1`} name="institution" placeholder="Établissement" />
          <input className={`${input} w-40`} name="date" placeholder="2018 — 2020" required />
        </div>
        <textarea className={input} name="details" rows={2} placeholder="Détails (une ligne par item)" />
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <label className="flex items-center gap-1">
            <input type="checkbox" name="showOnPdf" defaultChecked /> PDF
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="showOnCvPage" defaultChecked /> Page /cv
          </label>
          <button
            type="submit"
            className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
          >
            + Formation
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
