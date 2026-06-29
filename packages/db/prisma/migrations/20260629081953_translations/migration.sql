-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isAuto" BOOLEAN NOT NULL DEFAULT true,
    "sourceHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Translation_model_recordId_locale_idx" ON "Translation"("model", "recordId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_model_recordId_field_locale_key" ON "Translation"("model", "recordId", "field", "locale");
