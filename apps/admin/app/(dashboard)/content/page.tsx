import { prisma } from "@portfolio/db";
import { listKpis } from "@/lib/content/kpi";
import { createKpiAction, deleteKpiAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Content editor — KPIs (representative of the reusable CRUD pattern). */
export default async function ContentPage() {
  const kpis = await listKpis(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-semibold text-zinc-50">Contenu home — KPIs</h1>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {kpis.length === 0 ? (
          <li className="p-4 text-sm text-zinc-500">Aucun KPI.</li>
        ) : (
          kpis.map((kpi) => (
            <li key={kpi.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-zinc-500">{kpi.label}</div>
                <div className="text-lg font-bold text-amber-400">{kpi.value}</div>
                {kpi.note ? <div className="text-xs text-zinc-500">{kpi.note}</div> : null}
              </div>
              <form action={deleteKpiAction}>
                <input type="hidden" name="id" value={kpi.id} />
                <button
                  type="submit"
                  className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                >
                  Supprimer
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createKpiAction} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Ajouter un KPI</h2>
        <input className={inputCls} name="label" placeholder="Label (ex. Expérience)" required />
        <input className={inputCls} name="value" placeholder="Valeur (ex. 4 ans)" required />
        <input className={inputCls} name="note" placeholder="Note (optionnel)" />
        <button
          type="submit"
          className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
