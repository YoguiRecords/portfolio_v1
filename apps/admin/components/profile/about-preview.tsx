/** Données d'aperçu de la section publique « À propos » (état du formulaire profil). */
export interface AboutPreviewData {
  fullName: string;
  headline: string;
  currentRole?: string;
  location?: string;
  bio?: string;
  availabilityLabel?: string;
  isAvailable?: boolean;
}

/** Aperçu live du hero « À propos » rendu depuis l'état du formulaire profil. */
export function AboutPreview({ data }: { data: AboutPreviewData }) {
  const meta = [data.currentRole, data.location].filter(Boolean).join(" · ");
  return (
    <article className="flex flex-col gap-3">
      {data.availabilityLabel ? (
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            data.isAvailable ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
          {data.availabilityLabel}
        </span>
      ) : null}
      <h2 className="text-2xl font-black text-ink">{data.fullName || "Votre nom"}</h2>
      <p className="text-base font-medium text-accent">{data.headline || "Votre accroche"}</p>
      {meta ? <p className="text-sm text-muted">{meta}</p> : null}
      {data.bio ? <p className="text-sm text-ink-2">{data.bio}</p> : null}
    </article>
  );
}
