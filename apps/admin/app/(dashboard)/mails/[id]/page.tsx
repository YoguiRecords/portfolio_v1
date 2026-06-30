import Link from "next/link";
import { notFound } from "next/navigation";
import { getMailbox } from "@/lib/integrations/factory";
import { markMailReadAction } from "@/lib/actions/mail-actions";
import { MailReplyForm } from "@/components/mail-reply-form";

export const dynamic = "force-dynamic";

/** BO mail detail: full message + reply form. Marks the message read on open. */
export default async function MailDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mailbox = getMailbox();
  const message = await mailbox.getMessage(decodeURIComponent(id));
  if (!message) notFound();

  if (!message.isRead) {
    await markMailReadAction(message.id, true).catch(() => {});
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/mails" className="font-mono text-xs text-muted hover:text-accent lg:hidden">
        ← Mails
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-ink">{message.subject}</h1>
        <p className="text-sm text-muted">
          {message.fromName} &lt;{message.fromAddress}&gt; ·{" "}
          {new Date(message.receivedAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      <article className="whitespace-pre-wrap rounded-lg border border-border bg-bg p-4 text-sm text-ink-2">
        {message.body}
      </article>

      <MailReplyForm to={message.fromAddress} subject={`Re: ${message.subject}`} />
    </div>
  );
}
