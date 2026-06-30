-- Profile analyses reframed: the human-profile chapter swaps SWOT/PESTEL/PORTER
-- (flat AnalysisItem rows) for four frameworks — SWOT, 4P, Golden Circle, Ikigai —
-- each stored as a heterogeneous JSON payload (validated by Zod at the BO boundary).
-- PESTEL/PORTER leave the profile (they belong to project case studies / ProjectBlock).
-- Analysis content is re-seeded, so existing rows are cleared here.

-- Drop the per-item table: content now lives in Analysis.data (JSON)
DROP TABLE "AnalysisItem";

-- Clear existing analyses (semantics change; re-seeded by seed-content)
DELETE FROM "Analysis";

-- New columns: visibility toggle + the JSON payload
ALTER TABLE "Analysis"
  ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "data" JSONB NOT NULL DEFAULT '{}';

-- Swap the enum values (detach column → drop → recreate → reattach)
ALTER TABLE "Analysis" ALTER COLUMN "type" TYPE TEXT;
DROP TYPE "AnalysisType";
CREATE TYPE "AnalysisType" AS ENUM ('SWOT', 'FOUR_P', 'GOLDEN_CIRCLE', 'IKIGAI');
ALTER TABLE "Analysis" ALTER COLUMN "type" TYPE "AnalysisType" USING ("type"::"AnalysisType");

-- The unique constraint on type and app_web SELECT grant on "Analysis" are
-- unchanged (the table persists). AnalysisItem grants vanished with the table.
