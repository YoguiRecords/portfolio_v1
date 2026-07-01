-- Avatar (image de profil) du chatbot public, éditable au back office. URL d'un
-- média public ; le widget affiche un monogramme doré si elle est vide.
ALTER TABLE "AiAssistantConfig" ADD COLUMN "assistantAvatarUrl" TEXT;
