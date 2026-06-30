-- CreateEnum
CREATE TYPE "SkillKind" AS ENUM ('TECH', 'SOFT');

-- CreateEnum
CREATE TYPE "ProjectCvBadge" AS ENUM ('NONE', 'KEY', 'IN_PROGRESS');

-- CreateEnum
CREATE TYPE "ExperienceTier" AS ENUM ('FEATURED', 'PREVIOUS', 'MINI');

-- CreateEnum
CREATE TYPE "ExperienceBadge" AS ENUM ('NONE', 'PERSO', 'EN_COURS', 'CLE');

-- AlterTable
ALTER TABLE "Kpi" ADD COLUMN     "showOnCv" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "cvAccroche" TEXT,
ADD COLUMN     "cvAvailabilityStart" TEXT,
ADD COLUMN     "cvContractType" TEXT,
ADD COLUMN     "cvMobility" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "cvBadge" "ProjectCvBadge" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "showOnCv" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "kind" "SkillKind" NOT NULL DEFAULT 'TECH',
ADD COLUMN     "showOnCv" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "tier" "ExperienceTier" NOT NULL DEFAULT 'MINI',
    "badge" "ExperienceBadge" NOT NULL DEFAULT 'NONE',
    "stack" TEXT[],
    "bullets" TEXT[],
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showOnPdf" BOOLEAN NOT NULL DEFAULT false,
    "showOnCvPage" BOOLEAN NOT NULL DEFAULT true,
    "showOnSite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "institution" TEXT,
    "date" TEXT NOT NULL,
    "details" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "showOnPdf" BOOLEAN NOT NULL DEFAULT true,
    "showOnCvPage" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvExport" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Experience_order_idx" ON "Experience"("order");

-- CreateIndex
CREATE INDEX "Experience_startDate_idx" ON "Experience"("startDate");

-- CreateIndex
CREATE INDEX "Education_order_idx" ON "Education"("order");

-- CreateIndex
CREATE INDEX "Language_order_idx" ON "Language"("order");

-- CreateIndex
CREATE INDEX "Interest_order_idx" ON "Interest"("order");

-- CreateIndex
CREATE UNIQUE INDEX "CvExport_locale_key" ON "CvExport"("locale");
