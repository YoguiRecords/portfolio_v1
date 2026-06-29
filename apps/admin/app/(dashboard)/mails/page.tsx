import Link from "next/link";
import { getMailbox, isGraphLive } from "@/lib/integrations/factory";

export const dynamic = "force-dynamic";

/** Formats an ISO date for the message list (FR, compact). */
function fmt(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

/** BO mailbox: inbox of the connected professional mailbox (Exchange via Graph). */
export default async function MailsPage() {
  const messages = await getMailbox().listMessages("inbox");
  const live = isGraphLive();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-50">Mails</h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            live ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {live ? "Boîte connectée (Exchange)" : "Mode démo — boîte non connectée"}
        </span>
      </div>

      {messages.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun message.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
          {messages.map((m) => (
            <li key={m.id}>
              <Link
                href={`/mails/${encodeURIComponent(m.id)}`}
                className="flex flex-col gap-1 p-4 hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`truncate text-sm ${m.isRead ? "text-zinc-300" : "font-semibold text-zinc-50"}`}>
                    {m.fromName}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">{fmt(m.receivedAt)}</span>
                </div>
                <span className={`truncate text-sm ${m.isRead ? "text-zinc-400" : "text-zinc-100"}`}>
                  {!m.isRead ? "● " : ""}
                  {m.subject}
                </span>
                <span className="truncate text-xs text-zinc-500">{m.preview}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
