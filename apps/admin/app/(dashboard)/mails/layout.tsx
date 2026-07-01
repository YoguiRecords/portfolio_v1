import type { ReactNode } from "react";
import { requirePermission } from "@/lib/auth/guards";
import { getMailbox, isGraphLive } from "@/lib/integrations/factory";
import { MailsPane, type MailListItem } from "./mails-pane";

export const dynamic = "force-dynamic";

/**
 * Section mails en master-detail : la liste (panneau gauche) est rendue par ce
 * layout et **persiste** quand on ouvre un mail ; la page index et la page
 * `[id]` s'affichent dans le panneau droit (`children`).
 */
export default async function MailsLayout({ children }: { children: ReactNode }) {
  await requirePermission("inbox");
  const messages = await getMailbox().listMessages("inbox");
  const items: MailListItem[] = messages.map((m) => ({
    id: m.id,
    fromName: m.fromName,
    subject: m.subject,
    preview: m.preview,
    isRead: m.isRead,
    receivedAt: m.receivedAt,
  }));

  return (
    <MailsPane messages={items} live={isGraphLive()}>
      {children}
    </MailsPane>
  );
}
