import { requirePermission } from "@/lib/auth/guards";
import { prisma } from "@portfolio/db";
import { PageContainer } from "@/components/ui";
import { listMessages } from "@/lib/content/moderation";
import { markMessageReadAction, markMessageSpamAction } from "@/lib/actions/moderation-actions";

export const dynamic = "force-dynamic";

const btn = "rounded-md border border-border-strong px-3 py-1.5 text-sm text-ink-2 hover:bg-surface-2";

/** Contact inbox: messages (unread first), mark read / spam. */
export default async function MessagesPage() {
  await requirePermission("inbox");
  const messages = await listMessages(prisma);

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Messages de contact</h1>
      {messages.length === 0 ? (
        <p className="text-sm text-muted">Aucun message.</p>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-2 rounded-lg border p-4 ${
              m.isRead ? "border-border bg-surface" : "border-accent/40 bg-accent-soft"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">
                {m.name} · {m.email}
              </span>
              <span className="text-xs text-muted">{m.createdAt.toISOString().slice(0, 16)}</span>
            </div>
            {m.subject ? <div className="text-sm text-ink-2">{m.subject}</div> : null}
            <p className="text-sm text-muted">{m.message}</p>
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
        ))}
        </div>
      )}
    </PageContainer>
  );
}
