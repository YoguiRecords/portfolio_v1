import { prisma } from "@portfolio/db";
import { getMailbox } from "@/lib/integrations/factory";
import { aggregateInbox } from "@/lib/inbox/aggregate";
import { InboxList } from "@/components/inbox/inbox-list";

export const dynamic = "force-dynamic";

/** Unified inbox: Mails (Graph) + contact Messages in one view (RDV excluded). */
export default async function InboxPage() {
  const items = await aggregateInbox(
    {
      mailbox: getMailbox(),
      listContactMessages: () =>
        prisma.contactMessage.findMany({ where: { isSpam: false }, orderBy: { createdAt: "desc" } }),
    },
    "ALL",
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Boîte de réception</h1>
      <p className="text-sm text-muted">Mails et messages de contact réunis. Les demandes de RDV sont traitées à part.</p>
      <InboxList items={items} />
    </div>
  );
}
