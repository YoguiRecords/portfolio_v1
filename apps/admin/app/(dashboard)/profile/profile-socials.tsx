import { createSocialAction, deleteSocialAction } from "@/lib/actions/profile-actions";

interface Social {
  id: string;
  label: string;
  url: string;
  icon: string | null;
}

const input =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Social links editor (create/delete) for the profile. */
export function ProfileSocials({ socials }: { socials: Social[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-100">Réseaux sociaux</h2>

      <ul className="flex flex-col divide-y divide-zinc-800 rounded-lg border border-zinc-800">
        {socials.length === 0 ? (
          <li className="p-3 text-sm text-zinc-500">Aucun lien.</li>
        ) : (
          socials.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <span className="text-zinc-200">
                {s.label} <span className="text-zinc-500">— {s.url}</span>
              </span>
              <form action={deleteSocialAction}>
                <input type="hidden" name="id" value={s.id} />
                <button type="submit" className="text-xs text-zinc-500 hover:text-red-400">
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
        <button type="submit" className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
          + Ajouter
        </button>
      </form>
    </section>
  );
}
