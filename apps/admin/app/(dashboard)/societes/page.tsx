import { prisma } from "@portfolio/db";
import { Button, ConfirmSubmitButton } from "@/components/ui";
import { listCompanies } from "@/lib/crm/crm";
import { createCompanyAction, deleteCompanyAction } from "@/lib/actions/crm-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

/** CRM companies: list + create + delete. */
export default async function CompaniesPage() {
  const companies = await listCompanies(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Sociétés</h1>

      <ul className="flex flex-col divide-y divide-border rounded-card border border-border bg-surface">
        {companies.length === 0 ? (
          <li className="p-4 text-sm text-muted">Aucune société.</li>
        ) : (
          companies.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="font-medium text-ink">{c.name}</div>
                {c.website ? <div className="text-xs text-muted">{c.website}</div> : null}
              </div>
              <form action={deleteCompanyAction}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmSubmitButton label="Supprimer" />
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createCompanyAction} className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink-2">Nouvelle société</h2>
        <input className={inputCls} name="name" placeholder="Nom" required />
        <input className={inputCls} name="website" type="url" placeholder="https://site.example" />
        <textarea className={inputCls} name="notes" placeholder="Notes" rows={2} />
        <Button variant="primary" type="submit" className="self-start">
          Créer
        </Button>
      </form>
    </div>
  );
}
