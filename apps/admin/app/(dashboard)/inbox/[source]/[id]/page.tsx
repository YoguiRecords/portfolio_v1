import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@portfolio/db";
import { getMailbox } from "@/lib/integrations/factory";
import { markMessageRead } from "@/lib/content/moderation";
import { MailReplyForm } from "@/components/mail-reply-form";

export const dynamic = "force-dynamic";

function ItemView({ from, subject, body, to }: { from: string; subject: string; body: string; to: string }) {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/inbox" className="font-mono text-xs text-muted hover:text-accent lg:hidden">
        ← Boîte de réception
      </Link>
      <div className="rounded-card border border-border bg-surface p-4">
        <h1 className="text-lg font-bold text-ink">{subject}</h1>
        <p className="text-sm text-muted">{from}</p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink-2">{body}</p>
      </div>
      <MailReplyForm to={to} subject={`Re: ${subject}`} />
    </div>
  );
}

/** Unified inbox item view + reply (MAIL via Graph, CONTACT via email to sender). */
export default async function InboxItemPage({ params }: { params: Promise<{ source: string; id: string }> }) {
  const { source, id } = await params;

  if (source === "mail") {
    const mailbox = getMailbox();
    const message = await mailbox.getMessage(id);
    if (!message) notFound();
    await mailbox.markRead(id, true).catch(() => {});
    return (
      <ItemView
        from={`${message.fromName} <${message.fromAddress}>`}
        subject={message.subject}
        body={message.body}
        to={message.fromAddress}
      />
    );
  }

  if (source === "contact") {
    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) notFound();
    await markMessageRead(prisma, id).catch(() => {});
    return (
      <ItemView
        from={`${message.name} <${message.email}>`}
        subject={message.subject ?? "Message de contact"}
        body={message.message}
        to={message.email}
      />
    );
  }

  notFound();
}
