import { uploadProfileAvatarAction } from "@/lib/actions/profile-actions";

/** Avatar upload (secure pipeline → MinIO → linked to the profile). */
export function ProfileAvatar({ currentUrl }: { currentUrl: string | null }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-ink">Photo de profil</h2>
      <div className="flex items-center gap-4">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external MinIO URL
          <img src={currentUrl} alt="Avatar actuel" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border-strong text-xs text-muted">
            Aucune
          </div>
        )}
        <form action={uploadProfileAvatarAction} className="flex items-center gap-2">
          <input
            type="file"
            name="file"
            accept="image/*"
            required
            className="text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-ink-2"
          />
          <button type="submit" className="rounded-md bg-accent px-4 py-1.5 text-sm font-semibold text-bg hover:bg-accent-strong">
            Envoyer
          </button>
        </form>
      </div>
    </section>
  );
}
