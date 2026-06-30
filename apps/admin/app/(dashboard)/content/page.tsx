import { prisma } from "@portfolio/db";
import { Button, ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { listKpis } from "@/lib/content/kpi";
import { listSections } from "@/lib/content/home-section";
import {
  createKpiAction,
  updateKpiAction,
  deleteKpiAction,
  updateHomeSectionAction,
} from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** Content editor — home sections + KPIs (token-based v2 UI). */
export default async function ContentPage() {
  const [kpis, sections] = await Promise.all([listKpis(prisma), listSections(prisma)]);

  return (
    <PageContainer width="full">
      <div className="grid items-start gap-6 xl:grid-cols-2">
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-ink">Sections de la home</h1>
        <p className="text-sm text-muted">
          Édite les titres/intros et l’affichage de chaque section. La clé est structurelle (non
          modifiable).
        </p>
        {sections.map((s) => (
          <form
            key={s.id}
            action={updateHomeSectionAction}
            className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wide text-accent">{s.key}</span>
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" name="isVisible" defaultChecked={s.isVisible} /> Visible
              </label>
            </div>
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="key" value={s.key} />
            <input type="hidden" name="order" value={s.order} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} name="navLabel" defaultValue={s.navLabel ?? ""} placeholder="Nav" />
              <input className={inputCls} name="eyebrow" defaultValue={s.eyebrow ?? ""} placeholder="Eyebrow" />
            </div>
            <input className={inputCls} name="title" defaultValue={s.title ?? ""} placeholder="Titre" />
            <textarea className={inputCls} name="intro" defaultValue={s.intro ?? ""} placeholder="Intro" rows={2} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} name="ctaLabel" defaultValue={s.ctaLabel ?? ""} placeholder="CTA label" />
              <input className={inputCls} name="ctaHref" defaultValue={s.ctaHref ?? ""} placeholder="CTA lien" />
            </div>
            <Button variant="primary" size="sm" type="submit" className="self-start">
              Enregistrer
            </Button>
          </form>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-ink">Contenu home — KPIs</h2>
        <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
          {kpis.length === 0 ? (
            <li className="p-4 text-sm text-muted">Aucun KPI.</li>
          ) : (
            kpis.map((kpi) => (
              <li key={kpi.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">{kpi.label}</div>
                  <div className="text-lg font-bold text-accent">{kpi.value}</div>
                  {kpi.note ? <div className="text-xs text-muted">{kpi.note}</div> : null}
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateKpiAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={kpi.id} />
                    <input type="hidden" name="label" value={kpi.label} />
                    <input type="hidden" name="value" value={kpi.value} />
                    <input type="hidden" name="note" value={kpi.note ?? ""} />
                    <input type="hidden" name="order" value={kpi.order} />
                    <label className="flex items-center gap-1 text-xs text-muted">
                      <input type="checkbox" name="showOnCv" defaultChecked={kpi.showOnCv} /> CV
                    </label>
                    <button
                      type="submit"
                      className="rounded-md border border-border-strong px-2 py-1 text-xs text-ink-2 hover:bg-surface-2"
                    >
                      OK
                    </button>
                  </form>
                  <form action={deleteKpiAction}>
                    <input type="hidden" name="id" value={kpi.id} />
                    <ConfirmSubmitButton label="Supprimer" />
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>

        <form action={createKpiAction} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
          <h3 className="text-sm font-semibold text-ink-2">Ajouter un KPI</h3>
          <input className={inputCls} name="label" placeholder="Label (ex. Expérience)" required />
          <input className={inputCls} name="value" placeholder="Valeur (ex. 4 ans)" required />
          <input className={inputCls} name="note" placeholder="Note (optionnel)" />
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" name="showOnCv" /> Afficher sur le CV (« En chiffres »)
          </label>
          <Button variant="primary" type="submit" className="self-start">
            Ajouter
          </Button>
        </form>
      </section>
      </div>
    </PageContainer>
  );
}
