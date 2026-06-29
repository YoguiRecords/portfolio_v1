import type { Mailbox, MailFolder, MailMessage, SendMailInput } from "@portfolio/core/integrations";

/**
 * In-memory demo mailbox used until a real Exchange mailbox is connected via
 * Microsoft Graph. Lets the BO mail screens work end-to-end with sample data;
 * `sendMessage` is a no-op that just records the call (visible in dev logs).
 */
export class DemoMailbox implements Mailbox {
  private readonly messages: MailMessage[];

  constructor() {
    this.messages = [
      {
        id: "demo-1",
        fromAddress: "claire.moreau@atelier-nord.fr",
        fromName: "Claire Moreau",
        subject: "Proposition de mission — refonte produit",
        preview: "Bonjour Yohan, suite à notre échange, je reviens vers vous au sujet de…",
        body:
          "Bonjour Yohan,\n\nSuite à notre échange, je reviens vers vous au sujet de la refonte de notre produit. " +
          "Auriez-vous des disponibilités la semaine prochaine pour un premier cadrage ?\n\nBien à vous,\nClaire Moreau",
        receivedAt: "2026-06-28T09:12:00.000Z",
        isRead: false,
      },
      {
        id: "demo-2",
        fromAddress: "recrutement@scale-up.io",
        fromName: "Scale-Up RH",
        subject: "Opportunité CTO — échange ?",
        preview: "Votre profil hybride tech + management correspond à ce que nous cherchons…",
        body:
          "Bonjour,\n\nVotre profil hybride tech + management correspond à ce que nous cherchons pour un poste de CTO. " +
          "Seriez-vous ouvert à un échange ?\n\nCordialement,\nL'équipe Scale-Up",
        receivedAt: "2026-06-27T16:40:00.000Z",
        isRead: true,
      },
    ];
  }

  async listMessages(folder: MailFolder = "inbox"): Promise<MailMessage[]> {
    if (folder === "sent") return [];
    return [...this.messages].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }

  async getMessage(id: string): Promise<MailMessage | null> {
    return this.messages.find((m) => m.id === id) ?? null;
  }

  async markRead(id: string, isRead: boolean): Promise<void> {
    const msg = this.messages.find((m) => m.id === id);
    if (msg) msg.isRead = isRead;
  }

  async sendMessage(input: SendMailInput): Promise<void> {
    // Demo mode: nothing is actually sent.
    console.info(`[DemoMailbox] sendMessage → ${input.to} (${input.subject})`);
  }
}
