import { uploadProfileAvatarAction } from "@/lib/actions/profile-actions";

/** Avatar upload (secure pipeline → MinIO → linked to the profile). */
export function ProfileAvatar({ currentUrl }: { currentUrl: string | null }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-zinc-100">Photo de profil</h2>
      <div className="flex items-center gap-4">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external MinIO URL
          <img src={currentUrl} alt="Avatar actuel" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-700 text-xs text-zinc-500">
            Aucune
          </div>
        )}
        <form action={uploadProfileAvatarAction} className="flex items-center gap-2">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-sm file:text-zinc-200"
          />
          <button type="submit" className="rounded-md bg-amber-500 px-4 py-1.5 text-sm font-semibold text-amber-950 hover:bg-amber-600">
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
