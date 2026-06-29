-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('GAME', 'SOFTWARE', 'WEBSITE', 'BUSINESS');

-- CreateEnum
CREATE TYPE "TrendDirection" AS ENUM ('UP', 'DOWN', 'FLAT');

-- CreateEnum
CREATE TYPE "AnalysisType" AS ENUM ('SWOT', 'PESTEL', 'PORTER');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACHIEVED', 'IN_PROGRESS', 'TARGET', 'HORIZON');

-- CreateEnum
CREATE TYPE "ProjectBlockType" AS ENUM ('CONTEXT', 'PROCESS', 'ANALYSIS', 'GAME_DESIGN', 'ARCHITECTURE', 'SECURITY', 'DESIGN_UX', 'METRICS', 'RECOMMENDATIONS', 'RESULTS', 'GALLERY', 'TEXT');

-- CreateEnum
CREATE TYPE "FaqScope" AS ENUM ('GLOBAL', 'HOME', 'PROJECT', 'ARTICLE');

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "ogImageId" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "availabilityLabel" TEXT,
ADD COLUMN     "currentRole" TEXT,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sigText" TEXT,
ADD COLUMN     "typewriterLines" TEXT[];

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "ogImageId" TEXT,
ADD COLUMN     "periodLabel" TEXT,
ADD COLUMN     "role" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "sigText" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "statusLabel" TEXT,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'SOFTWARE';

-- CreateTable
CREATE TABLE "ProjectLink" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "brandName" TEXT,
    "siteName" TEXT,
    "defaultSeoTitle" TEXT,
    "defaultSeoDescription" TEXT,
    "twitterHandle" TEXT,
    "ogImageId" TEXT,
    "footerHeadline" TEXT,
    "footerSignature" TEXT,
    "contactEmail" TEXT,
    "isContactFormEnabled" BOOLEAN NOT NULL DEFAULT true,
    "availabilityBanner" TEXT,
    "allowAiCrawlers" BOOLEAN NOT NULL DEFAULT true,
    "llmsTxt" TEXT,
    "robotsExtra" TEXT,
    "searchConsoleToken" TEXT,
    "umamiWebsiteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeSection" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "navLabel" TEXT,
    "eyebrow" TEXT,
    "title" TEXT,
    "intro" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "ctaLabel2" TEXT,
    "ctaHref2" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqEntry" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "scope" "FaqScope" NOT NULL DEFAULT 'GLOBAL',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "projectId" TEXT,
    "articleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FaqEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isSpam" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kpi" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "trend" "TrendDirection",
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kpi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerTrack" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerMilestone" (
    "id" TEXT NOT NULL,
    "dateLabel" TEXT NOT NULL,
    "sortYear" INTEGER,
    "role" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerGoal" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'TARGET',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "type" "AnalysisType" NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisItem" (
    "id" TEXT NOT NULL,
    "groupLabel" TEXT NOT NULL,
    "text" TEXT,
    "verdict" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "analysisId" TEXT NOT NULL,

    CONSTRAINT "AnalysisItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectBlock" (
    "id" TEXT NOT NULL,
    "type" "ProjectBlockType" NOT NULL,
    "title" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL DEFAULT '{}',
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectLink_projectId_idx" ON "ProjectLink"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_ogImageId_key" ON "SiteSettings"("ogImageId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeSection_key_key" ON "HomeSection"("key");

-- CreateIndex
CREATE INDEX "HomeSection_order_idx" ON "HomeSection"("order");

-- CreateIndex
CREATE INDEX "FaqEntry_scope_order_idx" ON "FaqEntry"("scope", "order");

-- CreateIndex
CREATE INDEX "FaqEntry_projectId_idx" ON "FaqEntry"("projectId");

-- CreateIndex
CREATE INDEX "FaqEntry_articleId_idx" ON "FaqEntry"("articleId");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ContactMessage_isRead_idx" ON "ContactMessage"("isRead");

-- CreateIndex
CREATE INDEX "Kpi_order_idx" ON "Kpi"("order");

-- CreateIndex
CREATE INDEX "Skill_order_idx" ON "Skill"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CareerTrack_slug_key" ON "CareerTrack"("slug");

-- CreateIndex
CREATE INDEX "CareerTrack_order_idx" ON "CareerTrack"("order");

-- CreateIndex
CREATE INDEX "CareerMilestone_trackId_idx" ON "CareerMilestone"("trackId");

-- CreateIndex
CREATE INDEX "CareerMilestone_sortYear_idx" ON "CareerMilestone"("sortYear");

-- CreateIndex
CREATE INDEX "CareerGoal_order_idx" ON "CareerGoal"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_type_key" ON "Analysis"("type");

-- CreateIndex
CREATE INDEX "AnalysisItem_analysisId_idx" ON "AnalysisItem"("analysisId");

-- CreateIndex
CREATE INDEX "ProjectBlock_projectId_order_idx" ON "ProjectBlock"("projectId", "order");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLink" ADD CONSTRAINT "ProjectLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqEntry" ADD CONSTRAINT "FaqEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqEntry" ADD CONSTRAINT "FaqEntry_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerMilestone" ADD CONSTRAINT "CareerMilestone_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "CareerTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisItem" ADD CONSTRAINT "AnalysisItem_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectBlock" ADD CONSTRAINT "ProjectBlock_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────
-- Sécurité : table ContactMessage.
-- Le site public (rôle `app_web`) peut DÉPOSER un message via le formulaire de
-- contact, mais ne doit JAMAIS pouvoir les lire ni les modifier. Les default
-- privileges du schéma accordent SELECT à `app_web` sur les nouvelles tables :
-- on le révoque ici et on n'autorise que INSERT. Seul `app_admin` lit/gère les
-- messages. Le bloc DO reste sans effet là où les rôles applicatifs n'existent
-- pas (ex. CI).
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    REVOKE ALL PRIVILEGES ON TABLE "ContactMessage" FROM app_web;
    GRANT INSERT ON TABLE "ContactMessage" TO app_web;
  END IF;
END $$;
