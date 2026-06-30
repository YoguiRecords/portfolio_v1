-- Unify CrmTask into a generic Task model (data-preserving).
-- The table keeps its name via @@map("CrmTask"): FKs (onDelete: Cascade) and
-- the CRM RBAC grants/revokes stay intact. Only columns evolve here.

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('CRM', 'CONTENT', 'BILLING', 'GENERAL');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

-- AlterTable: add new columns (status nullable first to allow backfill)
ALTER TABLE "CrmTask"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "category" "TaskCategory" NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN "priority" "TaskPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "status" "TaskStatus";

-- Backfill: isDone -> status; tasks linked to a contact/deal become category CRM
UPDATE "CrmTask" SET "status" = CASE WHEN "isDone" THEN 'DONE'::"TaskStatus" ELSE 'TODO'::"TaskStatus" END;
UPDATE "CrmTask" SET "category" = 'CRM' WHERE "contactId" IS NOT NULL OR "dealId" IS NOT NULL;

-- Lock status + default once backfilled
ALTER TABLE "CrmTask" ALTER COLUMN "status" SET NOT NULL;
ALTER TABLE "CrmTask" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- Drop the obsolete isDone column and its index
DROP INDEX IF EXISTS "CrmTask_isDone_idx";
ALTER TABLE "CrmTask" DROP COLUMN "isDone";

-- CreateIndex
CREATE INDEX "CrmTask_status_idx" ON "CrmTask"("status");
CREATE INDEX "CrmTask_category_idx" ON "CrmTask"("category");
