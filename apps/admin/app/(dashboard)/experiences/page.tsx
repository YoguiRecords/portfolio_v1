import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { SortableList } from "@/components/ui/sortable-list";
import { listExperiences } from "@/lib/content/cv-corpus";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
  reorderExperiencesAction,
} from "@/lib/actions/cv-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";
const TIERS = ["FEATURED", "PREVIOUS", "MINI"] as const;
const BADGES = ["NONE", "PERSO", "EN_COURS", "CLE"] as const;

/** Formats a Date to a `yyyy-mm-dd` value for `<input type="date">`. */
function dateValue(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** CV editor — work experiences (drag to reorder, inline edit, delete). */
export default async function ExperiencesPage() {
  const experiences = await listExperiences(prisma);

  const rows = experiences.map((e) => ({
    id: e.id,
    content: (
      <div className="flex flex-col gap-2">
        <form action={updateExperienceAction} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={e.id} />
          <input type="hidden" name="order" value={e.order} />
          <div className="flex flex-wrap gap-2">
            <input className={`${input} flex-1`} name="title" defaultValue={e.title} placeholder="Intitulé" required />
            <input className={`${input} flex-1`} name="company" defaultValue={e.company} placeholder="Entreprise" required />
            <input className={`${input} w-40`} name="location" defaultValue={e.location ?? ""} placeholder="Lieu" />
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-muted">
              Début
              <input className={`${input} ml-1`} type="date" name="startDate" defaultValue={dateValue(e.startDate)} required />
            </label>
            <label className="text-xs text-muted">
              Fin
              <input className={`${input} ml-1`} type="date" name="endDate" defaultValue={dateValue(e.endDate)} />
            </label>
            <select className={input} name="tier" defaultValue={e.tier}>
              {TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select className={input} name="badge" defaultValue={e.badge}>
              {BADGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <input
            className={input}
            name="stack"
            defaultValue={e.stack.join(", ")}
            placeholder="Stack (séparée par des virgules)"
          />
          <textarea
            className={input}
            name="bullets"
            rows={2}
            defaultValue={e.bullets.join("\n")}
            placeholder="Réalisations (une par ligne)"
          />
          <textarea
            className={input}
            name="description"
            rows={2}
            defaultValue={e.description ?? ""}
            placeholder="Description longue (page /cv uniquement)"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
            <label className="flex items-center gap-1">
              <input type="checkbox" name="showOnPdf" defaultChecked={e.showOnPdf} /> PDF
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" name="showOnCvPage" defaultChecked={e.showOnCvPage} /> Page /cv
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" name="showOnSite" defaultChecked={e.showOnSite} /> Site
            </label>
            <button
              type="submit"
              className="ml-auto rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
            >
              Enregistrer
            </button>
          </div>
        </form>
        <form action={deleteExperienceAction} className="self-end">
          <input type="hidden" name="id" value={e.id} />
          <ConfirmSubmitButton label="Supprimer" />
        </form>
      </div>
    ),
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Expériences (CV)</h1>
      <p className="text-sm text-muted">
        Glissez la poignée ⠿ pour réordonner. Les drapeaux contrôlent l’apparition sur le PDF, la
        page /cv et le site.
      </p>

      <SortableList items={rows} reorderAction={reorderExperiencesAction} />

      <form
        action={createExperienceAction}
        className="flex flex-col gap-2 rounded-lg border border-dashed border-border-strong p-4"
      >
        <h2 className="text-sm font-semibold text-ink-2">Ajouter une expérience</h2>
        <div className="flex flex-wrap gap-2">
          <input className={`${input} flex-1`} name="title" placeholder="Intitulé" required />
          <input className={`${input} flex-1`} name="company" placeholder="Entreprise" required />
          <input className={`${input} w-40`} name="location" placeholder="Lieu" />
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="text-xs text-muted">
            Début
            <input className={`${input} ml-1`} type="date" name="startDate" required />
          </label>
          <label className="text-xs text-muted">
            Fin
            <input className={`${input} ml-1`} type="date" name="endDate" />
          </label>
          <select className={input} name="tier" defaultValue="MINI">
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select className={input} name="badge" defaultValue="NONE">
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <input className={input} name="stack" placeholder="Stack (séparée par des virgules)" />
        <textarea className={input} name="bullets" rows={2} placeholder="Réalisations (une par ligne)" />
        <textarea className={input} name="description" rows={2} placeholder="Description longue (page /cv)" />
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
          <label className="flex items-center gap-1">
            <input type="checkbox" name="showOnPdf" defaultChecked /> PDF
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="showOnCvPage" defaultChecked /> Page /cv
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" name="showOnSite" /> Site
          </label>
          <button
            type="submit"
            className="ml-auto rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
          >
            + Expérience
          </button>
        </div>
      </form>
    </PageContainer>
  );
}
