const TYPE_LABEL: Record<string, string> = {
  GAME: "Jeu",
  SOFTWARE: "Logiciel",
  WEBSITE: "Site web",
  BUSINESS: "Business",
};

/** Données minimales d'aperçu d'une fiche projet (état du formulaire éditeur). */
export interface ProjectPreviewData {
  title: string;
  tagline?: string;
  summary?: string;
  type: string;
  role?: string;
}

/** Aperçu de l'entête de fiche projet publique, rendu depuis l'état du formulaire. */
export function ProjectPreview({ data }: { data: ProjectPreviewData }) {
  return (
    <article className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-accent">
        {TYPE_LABEL[data.type] ?? data.type}
        {data.role ? ` · ${data.role}` : ""}
      </span>
      <h2 className="text-2xl font-black text-ink">{data.title || "Titre du projet"}</h2>
      {data.tagline ? <p className="text-base text-ink-2">{data.tagline}</p> : null}
      {data.summary ? <p className="text-sm text-muted">{data.summary}</p> : null}
    </article>
  );
}
