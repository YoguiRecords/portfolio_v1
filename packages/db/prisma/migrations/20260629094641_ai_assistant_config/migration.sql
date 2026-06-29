-- CreateTable
CREATE TABLE "AiAssistantConfig" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'openrouter/fusion',
    "systemPersona" TEXT,
    "isBoAssistEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPublicChatEnabled" BOOLEAN NOT NULL DEFAULT false,
    "monthlyTokenBudget" INTEGER NOT NULL DEFAULT 2000000,
    "tokensUsedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiAssistantConfig_pkey" PRIMARY KEY ("id")
);
