import type { Client } from "@microsoft/microsoft-graph-client";
import type { Mailbox, MailFolder, MailMessage, SendMailInput } from "@portfolio/core/integrations";

/** Shape of a Graph `message` resource (only the fields we project). */
interface GraphMessage {
  id: string;
  subject?: string;
  bodyPreview?: string;
  body?: { content?: string; contentType?: string };
  receivedDateTime?: string;
  isRead?: boolean;
  from?: { emailAddress?: { address?: string; name?: string } };
}

/** Strips HTML tags to a plain-text approximation (defensive — no rendering of remote HTML). */
function toPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function project(m: GraphMessage): MailMessage {
  const rawBody = m.body?.content ?? "";
  const body = m.body?.contentType?.toLowerCase() === "html" ? toPlainText(rawBody) : rawBody;
  return {
    id: m.id,
    fromAddress: m.from?.emailAddress?.address ?? "",
    fromName: m.from?.emailAddress?.name ?? m.from?.emailAddress?.address ?? "",
    subject: m.subject ?? "(sans objet)",
    preview: m.bodyPreview ?? "",
    body,
    receivedAt: m.receivedDateTime ?? new Date(0).toISOString(),
    isRead: m.isRead ?? false,
  };
}

/**
 * Real Exchange/Outlook mailbox over Microsoft Graph (app-only). Reads and sends
 * mail for the single configured mailbox. Bodies are flattened to plain text — we
 * never render remote HTML in the BO (XSS surface).
 */
export class GraphMailbox implements Mailbox {
  constructor(
    private readonly client: Client,
    private readonly user: string,
  ) {}

  private base(): string {
    return `/users/${encodeURIComponent(this.user)}`;
  }

  async listMessages(folder: MailFolder = "inbox"): Promise<MailMessage[]> {
    const wellKnown = folder === "sent" ? "sentitems" : "inbox";
    const res = await this.client
      .api(`${this.base()}/mailFolders/${wellKnown}/messages`)
      .top(30)
      .select("id,subject,bodyPreview,receivedDateTime,isRead,from")
      .orderby("receivedDateTime DESC")
      .get();
    return ((res.value as GraphMessage[]) ?? []).map(project);
  }

  async getMessage(id: string): Promise<MailMessage | null> {
    const m = (await this.client
      .api(`${this.base()}/messages/${id}`)
      .select("id,subject,bodyPreview,body,receivedDateTime,isRead,from")
      .get()) as GraphMessage | null;
    return m ? project(m) : null;
  }

  async markRead(id: string, isRead: boolean): Promise<void> {
    await this.client.api(`${this.base()}/messages/${id}`).patch({ isRead });
  }

  async sendMessage(input: SendMailInput): Promise<void> {
    await this.client.api(`${this.base()}/sendMail`).post({
      message: {
        subject: input.subject,
        body: { contentType: "Text", content: input.body },
        toRecipients: [{ emailAddress: { address: input.to } }],
      },
      saveToSentItems: true,
    });
  }
}
