import { z } from "zod";

/**
 * Zod schemas for the JSON `data` payload of each project block type. The DB
 * stores `ProjectBlock.type` + a free-form `data` JSON; these schemas validate
 * that payload at every boundary (admin write, public render) — no `any`.
 */

const shortText = z.string().min(1).max(200);
const longText = z.string().min(1).max(4000);

/** A percentage on the 0–100 timeline axis. */
const percent = z.number().min(0).max(100);

export const ContextBlock = z.object({
  problem: longText,
  objective: longText,
  role: shortText,
});

export const ProcessBlock = z.object({
  phases: z
    .array(
      z.object({
        label: shortText,
        start: percent,
        width: percent,
        style: z.enum(["green", "dark", "soft"]).optional(),
      }),
    )
    .min(1),
});

export const AnalysisBlock = z.object({
  kind: z.enum(["SWOT", "PESTEL", "PORTER"]),
  items: z
    .array(
      z.object({
        groupLabel: shortText,
        text: shortText.optional(),
        verdict: shortText.optional(),
      }),
    )
    .min(1),
});

export const GameDesignBlock = z.object({
  pillars: z.array(z.object({ name: shortText, desc: shortText })).min(1),
  coreLoop: z.array(shortText).min(1),
  mechanics: z.array(shortText).min(1),
});

export const ArchitectureBlock = z.object({
  layers: z.array(z.object({ name: shortText, desc: shortText.optional() })).min(1),
  decisions: z.array(shortText).optional(),
});

export const SecurityBlock = z.object({
  measures: z.array(z.object({ label: shortText, detail: shortText.optional() })).min(1),
});

export const DesignUxBlock = z.object({
  items: z.array(z.object({ label: shortText, value: shortText.optional() })).min(1),
});

export const MetricsBlock = z.object({
  scores: z.array(z.object({ label: shortText, value: shortText })).min(1),
});

export const RecommendationsBlock = z.object({
  items: z.array(z.object({ priority: shortText.optional(), text: shortText })).min(1),
  deliverables: z.array(shortText).optional(),
});

export const ResultsBlock = z.object({
  stats: z.array(z.object({ value: shortText, label: shortText })).min(1),
});

export const GalleryBlock = z.object({
  columns: z.number().int().min(1).max(4).optional(),
});

export const TextBlock = z.object({
  markdown: longText,
});

/** Maps each `ProjectBlockType` to its payload schema. */
export const blockSchemas = {
  CONTEXT: ContextBlock,
  PROCESS: ProcessBlock,
  ANALYSIS: AnalysisBlock,
  GAME_DESIGN: GameDesignBlock,
  ARCHITECTURE: ArchitectureBlock,
  SECURITY: SecurityBlock,
  DESIGN_UX: DesignUxBlock,
  METRICS: MetricsBlock,
  RECOMMENDATIONS: RecommendationsBlock,
  RESULTS: ResultsBlock,
  GALLERY: GalleryBlock,
  TEXT: TextBlock,
} as const;

/** The block type keys backed by a schema. */
export type ProjectBlockKind = keyof typeof blockSchemas;

/** Discriminated parse result for a block payload. */
export type ParsedBlock =
  | { type: "CONTEXT"; data: z.infer<typeof ContextBlock> }
  | { type: "PROCESS"; data: z.infer<typeof ProcessBlock> }
  | { type: "ANALYSIS"; data: z.infer<typeof AnalysisBlock> }
  | { type: "GAME_DESIGN"; data: z.infer<typeof GameDesignBlock> }
  | { type: "ARCHITECTURE"; data: z.infer<typeof ArchitectureBlock> }
  | { type: "SECURITY"; data: z.infer<typeof SecurityBlock> }
  | { type: "DESIGN_UX"; data: z.infer<typeof DesignUxBlock> }
  | { type: "METRICS"; data: z.infer<typeof MetricsBlock> }
  | { type: "RECOMMENDATIONS"; data: z.infer<typeof RecommendationsBlock> }
  | { type: "RESULTS"; data: z.infer<typeof ResultsBlock> }
  | { type: "GALLERY"; data: z.infer<typeof GalleryBlock> }
  | { type: "TEXT"; data: z.infer<typeof TextBlock> };

/**
 * Validates a block's JSON payload against its type's schema.
 *
 * @param type - the block type (from `ProjectBlock.type`).
 * @param data - the raw JSON payload.
 * @returns the typed block on success, or `null` if the type is unknown or the
 *          payload is invalid (callers render nothing — fail-safe).
 */
export function parseBlock(type: string, data: unknown): ParsedBlock | null {
  const schema = blockSchemas[type as ProjectBlockKind];
  if (!schema) return null;
  const result = schema.safeParse(data);
  if (!result.success) return null;
  return { type, data: result.data } as ParsedBlock;
}
