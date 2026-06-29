import { prisma } from "@portfolio/db";
import { listMessages } from "@/lib/content/moderation";
import { markMessageReadAction, markMessageSpamAction } from "@/lib/actions/moderation-actions";

export const dynamic = "force-dynamic";

const btn = "rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800";

/** Contact inbox: messages (unread first), mark read / spam. */
export default async function MessagesPage() {
  const messages = await listMessages(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-50">Messages de contact</h1>
      {messages.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun message.</p>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-2 rounded-lg border p-4 ${
              m.isRead ? "border-zinc-800 bg-zinc-900" : "border-amber-500/40 bg-amber-500/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">
                {m.name} · {m.email}
              </span>
              <span className="text-xs text-zinc-500">{m.createdAt.toISOString().slice(0, 16)}</span>
            </div>
            {m.subject ? <div className="text-sm text-zinc-300">{m.subject}</div> : null}
            <p className="text-sm text-zinc-400">{m.message}</p>
            <div className="flex gap-2">
              {!m.isRead ? (
                <form action={markMessageReadAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <button type="submit" className={btn}>Marquer lu</button>
                </form>
              ) : null}
              <form action={markMessageSpamAction}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className={btn}>Spam</button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
