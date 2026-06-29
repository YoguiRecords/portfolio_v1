import { Markdown } from "@/components/markdown/markdown";

/** Données minimales d'aperçu d'un article (état du formulaire éditeur). */
export interface ArticlePreviewData {
  title: string;
  excerpt?: string;
  content: string;
  tags?: string[];
}

/** Aperçu d'article rendu depuis l'état du formulaire (markdown sûr). */
export function ArticlePreview({ data }: { data: ArticlePreviewData }) {
  return (
    <article className="flex flex-col gap-3">
      <h2 className="text-2xl font-black text-ink">{data.title || "Titre de l’article"}</h2>
      {data.excerpt ? <p className="text-base text-ink-2">{data.excerpt}</p> : null}
      {data.tags && data.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {data.tags.map((tag) => (
            <span key={tag} className="rounded-[3px] bg-accent/[0.07] px-2 py-0.5 text-xs font-medium text-accent">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <Markdown content={data.content} />
    </article>
  );
}
