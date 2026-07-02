import { requirePermission } from "@/lib/auth/guards";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { Button, PageContainer, Panel, Status, type StatusVariant } from "@/components/ui";
import { getContact } from "@/lib/crm/crm";
import { createActivityAction, createTaskAction, setTaskStatusAction } from "@/lib/actions/crm-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-control border border-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent";

const STATUS_META: Record<string, { variant: StatusVariant; label: string }> = {
  LEAD: { variant: "review", label: "Lead" },
  ACTIVE: { variant: "published", label: "Actif" },
  CUSTOMER: { variant: "published", label: "Client" },
  ARCHIVED: { variant: "draft", label: "Archivé" },
};

/** Contact 360° view: info + deals + activity timeline + follow-up tasks. */
export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contacts");
  const { id } = await params;
  const contact = await getContact(prisma, id);
  if (!contact) notFound();
  const meta = STATUS_META[contact.status];

  return (
    <PageContainer width="full">
      <div>
        <Link href="/contacts" className="font-mono text-xs text-muted hover:text-accent">
          ← Contacts
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-bold text-ink">
            {contact.firstName} {contact.lastName ?? ""}
          </h1>
          {meta ? <Status variant={meta.variant}>{meta.label}</Status> : null}
        </div>
        <p className="text-sm text-muted">
          {[contact.role, contact.company?.name, contact.email, contact.phone].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Affaires liées">
          {contact.deals.length === 0 ? (
            <p className="text-sm text-muted">Aucune affaire.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {contact.deals.map((d) => (
                <li key={d.id} className="flex justify-between text-sm">
                  <span className="text-ink-2">{d.title}</span>
                  <span className="text-muted">{d.stage}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Tâches / relances">
          <ul className="flex flex-col gap-2">
            {contact.tasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                <span className={t.status === "DONE" ? "text-muted line-through" : "text-ink-2"}>{t.title}</span>
                <form action={setTaskStatusAction}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="status" value={t.status === "DONE" ? "TODO" : "DONE"} />
                  <Button variant="subtle" size="sm" type="submit">
                    {t.status === "DONE" ? "Rouvrir" : "Fait"}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createTaskAction} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="contactId" value={contact.id} />
            <input type="hidden" name="category" value="CRM" />
            <input className={inputCls} name="title" placeholder="Nouvelle tâche…" required />
            <input className={inputCls} name="dueAt" type="datetime-local" />
            <Button variant="primary" size="sm" type="submit" className="self-start">
              Ajouter une tâche
            </Button>
          </form>
        </Panel>

        <Panel title="Activités & notes">
        <form action={createActivityAction} className="flex flex-col gap-2">
          <input type="hidden" name="contactId" value={contact.id} />
          <div className="flex gap-2">
            <select name="type" defaultValue="NOTE" className={inputCls}>
              <option value="NOTE">Note</option>
              <option value="CALL">Appel</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Réunion</option>
            </select>
          </div>
          <textarea className={inputCls} name="content" placeholder="Contenu de l’activité…" rows={2} required />
          <Button variant="primary" size="sm" type="submit" className="self-start">
            Ajouter
          </Button>
        </form>

        <ul className="mt-4 flex flex-col gap-3">
          {contact.activities.length === 0 ? (
            <li className="text-sm text-muted">Aucune activité.</li>
          ) : (
            contact.activities.map((a) => (
              <li key={a.id} className="border-l-2 border-accent pl-3">
                <div className="text-xs uppercase tracking-wide text-muted">
                  {a.type} · {a.occurredAt.toLocaleDateString("fr-FR")}
                </div>
                <div className="text-sm text-ink-2">{a.content}</div>
              </li>
            ))
          )}
        </ul>
        </Panel>
      </div>
    </PageContainer>
  );
}
