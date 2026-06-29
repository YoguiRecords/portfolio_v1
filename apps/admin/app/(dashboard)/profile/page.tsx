import { prisma } from "@portfolio/db";
import { upsertProfileAction } from "@/lib/actions/content-actions";

export const dynamic = "force-dynamic";

const inputCls =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline focus:outline-2 focus:outline-amber-500";

/** Profile editor (singleton). Translatable fields use LocalizedField in the
 *  fuller editor; this representative form covers the core identity fields. */
export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst();

  return (
    <form action={upsertProfileAction} className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold text-zinc-50">Profil</h1>

      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Nom complet
        <input className={inputCls} name="fullName" defaultValue={profile?.fullName ?? ""} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Headline
        <input className={inputCls} name="headline" defaultValue={profile?.headline ?? ""} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Email
        <input className={inputCls} name="email" type="email" defaultValue={profile?.email ?? ""} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Bio
        <textarea className={`${inputCls} min-h-28`} name="bio" defaultValue={profile?.bio ?? ""} required />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Phrases du typewriter (une par ligne)
        <textarea
          className={`${inputCls} min-h-24`}
          name="typewriterLines"
          defaultValue={(profile?.typewriterLines ?? []).join("\n")}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        Signature
        <input className={inputCls} name="sigText" defaultValue={profile?.sigText ?? ""} />
      </label>

      <button
        type="submit"
        className="self-start rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-600"
      >
        Enregistrer
      </button>
    </form>
  );
}
