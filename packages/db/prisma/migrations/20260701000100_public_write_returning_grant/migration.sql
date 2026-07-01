-- ──────────────────────────────────────────────────────────────────────────
-- Fix : formulaires publics (contact + demande de RDV). Le rôle `app_web` peut
-- INSÉRER dans `ContactMessage` et `AppointmentRequest`, mais Prisma `create()`
-- émet un `INSERT ... RETURNING`, qui exige le privilège SELECT sur les colonnes
-- retournées. Sans aucun grant SELECT, l'insertion échoue :
--   « permission denied for table ContactMessage / AppointmentRequest ».
--
-- On accorde uniquement `SELECT (id)` : `app_web` peut relire l'id qu'il vient
-- d'écrire (nécessaire au RETURNING), mais JAMAIS le message, l'e-mail, l'IP ni
-- le user-agent (PII confinée à la boîte de réception du back office). Le code
-- web borne d'ailleurs le RETURNING à `id` (`select: { id: true }`).
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    GRANT SELECT ("id") ON TABLE "ContactMessage" TO app_web;
    GRANT SELECT ("id") ON TABLE "AppointmentRequest" TO app_web;
  END IF;
END $$;
