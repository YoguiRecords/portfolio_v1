import { createSocialAction, deleteSocialAction } from "@/lib/actions/profile-actions";

interface Social {
  id: string;
  label: string;
  url: string;
  icon: string | null;
}

const input =
  "rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-ink focus:outline focus:outline-2 focus:outline-accent";

/** Social links editor (create/delete) for the profile. */
export function ProfileSocials({ socials }: { socials: Social[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-ink">Réseaux sociaux</h2>

      <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {socials.length === 0 ? (
          <li className="p-3 text-sm text-muted">Aucun lien.</li>
        ) : (
          socials.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="text-ink-2">
                {s.label} <span className="text-muted">— {s.url}</span>
              </span>
              <form action={deleteSocialAction}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="text-xs text-muted hover:text-danger">
                  ✕
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form action={createSocialAction} className="flex flex-wrap items-end gap-2">
        <input className={input} name="label" placeholder="Label (ex. LinkedIn)" required />
        <input className={`${input} flex-1`} name="url" type="url" placeholder="https://…" required />
        <input className={`${input} w-28`} name="icon" placeholder="Icône" />
        <button type="submit" className="rounded-md border border-border-strong px-3 py-2 text-sm text-ink-2 hover:bg-surface-2">
          + Ajouter
        </button>
      </form>
    </section>
  );
}
