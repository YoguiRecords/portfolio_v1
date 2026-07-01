-- ──────────────────────────────────────────────────────────────────────────
-- Chatbot public : le endpoint `/api/chat` (rôle `app_web`) doit incrémenter le
-- compteur mensuel de tokens pour que le garde-fou budget (`assertBudget`) soit
-- réellement effectif d'une requête à l'autre. On accorde un `UPDATE` **limité à
-- la seule colonne compteur** `tokensUsedThisMonth` — `app_web` ne peut toujours
-- pas modifier le modèle, la persona, l'activation ni le plafond.
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    GRANT UPDATE ("tokensUsedThisMonth") ON TABLE "AiAssistantConfig" TO app_web;
  END IF;
END $$;
