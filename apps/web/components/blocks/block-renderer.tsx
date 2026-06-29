import { parseBlock } from "@portfolio/core";
import styles from "./blocks.module.css";
import { ContextBlock } from "./context-block";
import { ProcessBlock } from "./process-block";
import { AnalysisBlock } from "./analysis-block";
import { GameDesignBlock } from "./game-design-block";
import { ArchitectureBlock } from "./architecture-block";
import { SecurityBlock } from "./security-block";
import { DesignUxBlock } from "./design-ux-block";
import { MetricsBlock } from "./metrics-block";
import { RecommendationsBlock } from "./recommendations-block";
import { ResultsBlock } from "./results-block";
import { GalleryBlock, type GalleryImage } from "./gallery-block";
import { TextBlock } from "./text-block";

/** Raw block row from the DB (type + JSON payload). */
export interface RawBlock {
  id: string;
  type: string;
  title: string | null;
  data: unknown;
}

/** Default mono tag shown above each block when it has no explicit title. */
const TAG_LABELS: Record<string, string> = {
  CONTEXT: "Contexte",
  PROCESS: "Démarche",
  ANALYSIS: "Analyse",
  GAME_DESIGN: "Game design",
  ARCHITECTURE: "Architecture",
  SECURITY: "Sécurité",
  DESIGN_UX: "Design / UX",
  METRICS: "Mesures",
  RECOMMENDATIONS: "Recommandations",
  RESULTS: "Résultats",
  GALLERY: "Galerie",
  TEXT: "Texte",
};

/** Dispatches a validated block payload to its presentational component. */
function BlockBody({
  parsed,
  images,
}: {
  parsed: NonNullable<ReturnType<typeof parseBlock>>;
  images: GalleryImage[];
}) {
  switch (parsed.type) {
    case "CONTEXT":
      return <ContextBlock data={parsed.data} />;
    case "PROCESS":
      return <ProcessBlock data={parsed.data} />;
    case "ANALYSIS":
      return <AnalysisBlock data={parsed.data} />;
    case "GAME_DESIGN":
      return <GameDesignBlock data={parsed.data} />;
    case "ARCHITECTURE":
      return <ArchitectureBlock data={parsed.data} />;
    case "SECURITY":
      return <SecurityBlock data={parsed.data} />;
    case "DESIGN_UX":
      return <DesignUxBlock data={parsed.data} />;
    case "METRICS":
      return <MetricsBlock data={parsed.data} />;
    case "RECOMMENDATIONS":
      return <RecommendationsBlock data={parsed.data} />;
    case "RESULTS":
      return <ResultsBlock data={parsed.data} />;
    case "GALLERY":
      return <GalleryBlock images={images} />;
    case "TEXT":
      return <TextBlock data={parsed.data} />;
    default:
      return null;
  }
}

/**
 * Renders the ordered list of case-study blocks. Each block's JSON payload is
 * validated by its Zod schema; unknown types or invalid payloads are skipped
 * (fail-safe — never throws in production).
 */
export function BlockRenderer({
  blocks,
  images,
}: {
  blocks: RawBlock[];
  images: GalleryImage[];
}) {
  return (
    <>
      {blocks.map((block) => {
        const parsed = parseBlock(block.type, block.data);
        if (!parsed) return null;
        return (
          <section key={block.id} className={styles.block}>
            <div className={styles.head}>
              <span className={styles.tag}>{TAG_LABELS[block.type] ?? block.type}</span>
              {block.title ? <h3>{block.title}</h3> : null}
            </div>
            <BlockBody parsed={parsed} images={images} />
          </section>
        );
      })}
    </>
  );
}
