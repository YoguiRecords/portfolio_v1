import type { ReactNode } from "react";
import { prisma } from "@portfolio/db";
import { getMailbox } from "@/lib/integrations/factory";
import { aggregateInbox } from "@/lib/inbox/aggregate";
import { InboxPane } from "./inbox-pane";

export const dynamic = "force-dynamic";

/**
 * Section boîte de réception en master-detail : la liste unifiée (panneau gauche)
 * vit dans ce layout et persiste à l'ouverture d'un message ; la page index et la
 * page `[source]/[id]` s'affichent dans le panneau droit (`children`).
 */
export default async function InboxLayout({ children }: { children: ReactNode }) {
  const items = await aggregateInbox(
    {
      mailbox: getMailbox(),
      listContactMessages: () =>
        prisma.contactMessage.findMany({ where: { isSpam: false }, orderBy: { createdAt: "desc" } }),
    },
    "ALL",
  );

  return <InboxPane items={items}>{children}</InboxPane>;
}
