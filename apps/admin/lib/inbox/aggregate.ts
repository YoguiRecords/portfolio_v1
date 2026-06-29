import type { Mailbox } from "@portfolio/core/integrations";

/** Source d'un élément de la boîte de réception unifiée (RDV exclus). */
export type InboxSource = "MAIL" | "CONTACT";

/** Élément normalisé de la boîte de réception (mail Graph ou message de contact). */
export interface InboxItem {
  id: string;
  source: InboxSource;
  from: string;
  contactEmail: string;
  subject: string;
  preview: string;
  /** ISO 8601, pour tri et affichage. */
  date: string;
  isRead: boolean;
}

/** Message de contact normalisable (sous-ensemble de `ContactMessage`). */
export interface ContactMessageLike {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

/** Dépendances injectées (mailbox réel/démo + lecture des messages). Testable. */
export interface InboxDeps {
  mailbox: Pick<Mailbox, "listMessages">;
  listContactMessages: () => Promise<ContactMessageLike[]>;
}

export type InboxFilter = "ALL" | "MAIL" | "CONTACT";

function preview(text: string, max = 140): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/**
 * Agrège **Mails (Graph) + Messages de contact** en une vue unique triée par date
 * décroissante, filtrable par source. Tolérant : une panne du mailbox renvoie
 * une liste vide pour cette source (n'efface pas les messages de contact).
 * **RDV exclus** (traités à part, P8).
 */
export async function aggregateInbox(deps: InboxDeps, filter: InboxFilter = "ALL"): Promise<InboxItem[]> {
  const items: InboxItem[] = [];

  if (filter !== "CONTACT") {
    const mails = await deps.mailbox.listMessages("inbox").catch(() => []);
    for (const m of mails) {
      items.push({
        id: m.id,
        source: "MAIL",
        from: m.fromName || m.fromAddress,
        contactEmail: m.fromAddress,
        subject: m.subject,
        preview: m.preview,
        date: m.receivedAt,
        isRead: m.isRead,
      });
    }
  }

  if (filter !== "MAIL") {
    const messages = await deps.listContactMessages();
    for (const c of messages) {
      items.push({
        id: c.id,
        source: "CONTACT",
        from: c.name,
        contactEmail: c.email,
        subject: c.subject ?? "Message de contact",
        preview: preview(c.message),
        date: c.createdAt.toISOString(),
        isRead: c.isRead,
      });
    }
  }

  return items.sort((a, b) => b.date.localeCompare(a.date));
}
