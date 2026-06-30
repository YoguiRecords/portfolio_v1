import { z } from "zod";

/**
 * Zod schemas for the profile-level strategic analyses (chapter "Qui je suis").
 *
 * Each `Analysis` row stores `type` + a free-form `data` JSON; these schemas
 * validate that payload at every boundary (BO write, public render) — no `any`.
 * The four frameworks have heterogeneous shapes (mirrors the `ProjectBlock`
 * JSON+Zod pattern), so each gets its own schema.
 */

/** The four frameworks applied to the human profile. */
export const ANALYSIS_TYPES = ["SWOT", "FOUR_P", "GOLDEN_CIRCLE", "IKIGAI"] as const;
export type AnalysisType = (typeof ANALYSIS_TYPES)[number];

const label = z.string().max(60).default("");
const bullet = z.string().max(200);
const bullets = z.array(bullet).max(10).default([]);
/** A single statement (allowed empty so partial BO saves don't 500). */
const statement = z.string().max(400).default("");

// ── SWOT — 4 quadrants, each a labelled list of bullets ──
const SwotQuadrant = z.object({ label, items: bullets });
export const SwotData = z.object({
  strengths: SwotQuadrant,
  weaknesses: SwotQuadrant,
  opportunities: SwotQuadrant,
  threats: SwotQuadrant,
});

// ── 4P — 4 levers, each a label + role + bullets ──
const FourPLever = z.object({ label, role: z.string().max(60).default(""), points: bullets });
export const FourPData = z.object({
  product: FourPLever,
  price: FourPLever,
  place: FourPLever,
  promotion: FourPLever,
});

// ── Golden Circle — Why / How / What ──
export const GoldenCircleData = z.object({ why: statement, how: statement, what: statement });

// ── Ikigai — 4 zones + the centre statement ──
export const IkigaiData = z.object({
  love: statement, // ce que j'aime
  good: statement, // ce où je suis bon
  world: statement, // ce dont le monde a besoin
  paid: statement, // ce pour quoi on me paie
  center: statement, // l'ikigai (synthèse)
});

export type SwotQuadrant = z.infer<typeof SwotQuadrant>;
export type SwotData = z.infer<typeof SwotData>;
export type FourPLever = z.infer<typeof FourPLever>;
export type FourPData = z.infer<typeof FourPData>;
export type GoldenCircleData = z.infer<typeof GoldenCircleData>;
export type IkigaiData = z.infer<typeof IkigaiData>;

/** Maps each `AnalysisType` to its payload schema. */
export const analysisSchemas = {
  SWOT: SwotData,
  FOUR_P: FourPData,
  GOLDEN_CIRCLE: GoldenCircleData,
  IKIGAI: IkigaiData,
} as const;

/** Discriminated parse result for an analysis payload. */
export type ParsedAnalysis =
  | { type: "SWOT"; data: SwotData }
  | { type: "FOUR_P"; data: FourPData }
  | { type: "GOLDEN_CIRCLE"; data: GoldenCircleData }
  | { type: "IKIGAI"; data: IkigaiData };

/**
 * Validates an analysis JSON payload against its type's schema.
 *
 * @param type - the analysis type (from `Analysis.type`).
 * @param data - the raw JSON payload.
 * @returns the typed analysis on success, or `null` if the type is unknown or
 *          the payload is invalid (callers render nothing — fail-safe).
 */
export function parseAnalysis(type: string, data: unknown): ParsedAnalysis | null {
  const schema = analysisSchemas[type as AnalysisType];
  if (!schema) return null;
  const result = schema.safeParse(data);
  if (!result.success) return null;
  return { type, data: result.data } as ParsedAnalysis;
}

/** Human labels for the BO type picker. */
export const ANALYSIS_TYPE_LABELS: Record<AnalysisType, string> = {
  SWOT: "SWOT",
  FOUR_P: "4P — Mix marketing",
  GOLDEN_CIRCLE: "Golden Circle",
  IKIGAI: "Ikigai",
};

/** Empty (but schema-valid) defaults used to seed new BO editors. */
export const ANALYSIS_DEFAULTS: { [K in AnalysisType]: z.infer<(typeof analysisSchemas)[K]> } = {
  SWOT: {
    strengths: { label: "Forces", items: [] },
    weaknesses: { label: "Faiblesses", items: [] },
    opportunities: { label: "Opportunités", items: [] },
    threats: { label: "Menaces", items: [] },
  },
  FOUR_P: {
    product: { label: "Produit", role: "L'offre", points: [] },
    price: { label: "Prix", role: "Positionnement", points: [] },
    place: { label: "Place", role: "Distribution", points: [] },
    promotion: { label: "Promotion", role: "Communication", points: [] },
  },
  GOLDEN_CIRCLE: { why: "", how: "", what: "" },
  IKIGAI: { love: "", good: "", world: "", paid: "", center: "" },
};
