import { prisma } from "@portfolio/db";
import { TESTIMONIAL_RELATIONSHIPS } from "@portfolio/core";
import { listTestimonials } from "@/lib/content/moderation";
import {
  approveTestimonialAction,
  rejectTestimonialAction,
  editTestimonialAction,
} from "@/lib/actions/moderation-actions";

export const dynamic = "force-dynamic";

const btn = "rounded-md border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800";

/** Testimonial moderation: approve / reject / edit displayed content. */
export default async function ModerationPage() {
  const items = await listTestimonials(prisma);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-semibold text-zinc-50">Modération des témoignages</h1>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Aucun témoignage.</p>
      ) : (
        items.map((t) => (
          <div key={t.id} className="flex flex-col gap-3 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-100">
                {t.authorName}
                {t.authorRole ? ` · ${t.authorRole}` : ""}
                {t.authorCompany ? ` · ${t.authorCompany}` : ""}
                {t.authorRelationship ? (
                  <span className="ml-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                    {TESTIMONIAL_RELATIONSHIPS[t.authorRelationship]}
                  </span>
                ) : null}
              </span>
              <span className="text-xs uppercase tracking-wide text-amber-400">{t.status}</span>
            </div>
            <form action={editTestimonialAction} className="flex flex-col gap-2">
              <input type="hidden" name="id" value={t.id} />
              <textarea
                name="content"
                defaultValue={t.content}
                className="min-h-20 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              />
              <button type="submit" className={`${btn} self-start`}>
                Enregistrer le texte affiché
              </button>
            </form>
            <p className="text-xs text-zinc-500">Original (audit) : {t.submittedContent}</p>
            <div className="flex gap-2">
              <form action={approveTestimonialAction}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className={btn}>Accepter</button>
              </form>
              <form action={rejectTestimonialAction}>
                <input type="hidden" name="id" value={t.id} />
                <button type="submit" className={btn}>Refuser</button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
