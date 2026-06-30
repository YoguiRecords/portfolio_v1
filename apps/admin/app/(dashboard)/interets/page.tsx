import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { SortableList } from "@/components/ui/sortable-list";
import { listInterests } from "@/lib/content/cv-corpus";
import {
  createInterestAction,
  updateInterestAction,
  deleteInterestAction,
  reorderInterestsAction,
} from "@/lib/actions/cv-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** CV editor — interests (drag to reorder, inline edit, delete). */
export default async function InteretsPage() {
  const items = await listInterests(prisma);

  const rows = items.map((it) => ({
    id: it.id,
    content: (
      <div className="flex flex-wrap items-center gap-2">
        <form action={updateInterestAction} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={it.id} />
          <input type="hidden" name="order" value={it.order} />
          <input className={`${input} flex-1`} name="label" defaultValue={it.label} placeholder="Centre d’intérêt" required />
          <button
            type="submit"
            className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
          >
            Enregistrer
          </button>
        </form>
        <form action={deleteInterestAction}>
          <input type="hidden" name="id" value={it.id} />
          <ConfirmSubmitButton label="✕" />
        </form>
      </div>
    ),
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Intérêts (CV)</h1>
      <p className="text-sm text-muted">Glissez la poignée ⠿ pour réordonner.</p>

      <SortableList items={rows} reorderAction={reorderInterestsAction} />

      <form
        action={createInterestAction}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border-strong p-4"
      >
        <input className={`${input} flex-1`} name="label" placeholder="Centre d’intérêt" required />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          + Intérêt
        </button>
      </form>
    </PageContainer>
  );
}
