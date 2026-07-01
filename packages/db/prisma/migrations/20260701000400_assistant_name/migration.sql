-- Prénom de l'e-secrétaire IA (chatbot public), éditable au back office. Sert à
-- la fois à l'affichage (entête du widget) et à sa présentation dans le prompt.
ALTER TABLE "AiAssistantConfig" ADD COLUMN "assistantName" TEXT NOT NULL DEFAULT 'Friday';
