import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { listContacts, listDeals } from "@/lib/crm/crm";
import { createDealAction, setDealStageAction } from "@/lib/actions/crm-actions";
import { PipelineBoard, type DealCardRow } from "@/components/crm/pipeline-board";

export const dynamic = "force-dynamic";

/** CRM pipeline board: columns by stage, move deals, per-column totals. */
export default async function PipelinePage() {
  await requirePermission("pipeline");
  const [deals, contacts] = await Promise.all([listDeals(prisma), listContacts(prisma)]);

  const cards: DealCardRow[] = deals.map((d) => ({
    id: d.id,
    title: d.title,
    contactName: `${d.contact.firstName} ${d.contact.lastName ?? ""}`.trim(),
    valueCents: d.valueCents,
    stage: d.stage,
  }));
  const contactOptions = contacts.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName ?? ""}`.trim(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Pipeline</h1>
      <PipelineBoard
        deals={cards}
        contacts={contactOptions}
        actions={{ setStage: setDealStageAction, create: createDealAction }}
      />
    </div>
  );
}
