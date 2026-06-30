import { prisma } from "@portfolio/db";
import { ConfirmSubmitButton, PageContainer } from "@/components/ui";
import { SortableList } from "@/components/ui/sortable-list";
import { listLanguages } from "@/lib/content/cv-corpus";
import {
  createLanguageAction,
  updateLanguageAction,
  deleteLanguageAction,
  reorderLanguagesAction,
} from "@/lib/actions/cv-actions";

export const dynamic = "force-dynamic";

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** CV editor — languages (drag to reorder, inline edit, delete). */
export default async function LanguesPage() {
  const items = await listLanguages(prisma);

  const rows = items.map((l) => ({
    id: l.id,
    content: (
      <div className="flex flex-wrap items-center gap-2">
        <form action={updateLanguageAction} className="flex flex-1 flex-wrap items-center gap-2">
          <input type="hidden" name="id" value={l.id} />
          <input type="hidden" name="order" value={l.order} />
          <input className={`${input} flex-1`} name="name" defaultValue={l.name} placeholder="Langue" required />
          <input className={`${input} flex-1`} name="level" defaultValue={l.level} placeholder="Niveau" required />
          <button
            type="submit"
            className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2"
          >
            Enregistrer
          </button>
        </form>
        <form action={deleteLanguageAction}>
          <input type="hidden" name="id" value={l.id} />
          <ConfirmSubmitButton label="✕" />
        </form>
      </div>
    ),
  }));

  return (
    <PageContainer width="full">
      <h1 className="text-2xl font-semibold text-ink">Langues (CV)</h1>
      <p className="text-sm text-muted">Glissez la poignée ⠿ pour réordonner.</p>

      <SortableList items={rows} reorderAction={reorderLanguagesAction} />

      <form
        action={createLanguageAction}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border-strong p-4"
      >
        <input className={`${input} flex-1`} name="name" placeholder="Langue (ex. Anglais)" required />
        <input className={`${input} flex-1`} name="level" placeholder="Niveau (ex. C1)" required />
        <button
          type="submit"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-strong"
        >
          + Langue
        </button>
      </form>
    </PageContainer>
  );
}
