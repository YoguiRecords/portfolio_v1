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
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/mails" className="font-mono text-xs text-zinc-500 hover:text-amber-400">
        ← Mails
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-zinc-50">{message.subject}</h1>
        <p className="text-sm text-zinc-400">
          {message.fromName} &lt;{message.fromAddress}&gt; ·{" "}
          {new Date(message.receivedAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </header>

      <article className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
        {message.body}
      </article>

      <MailReplyForm to={message.fromAddress} subject={`Re: ${message.subject}`} />
    </div>
  );
}
