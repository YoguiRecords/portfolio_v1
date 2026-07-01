-- ──────────────────────────────────────────────────────────────────────────
-- Friday booking : identité du visiteur + annulation self-service + vacances.
--
-- 1. `AppointmentRequest` : colonnes identité (firstName/lastName/phone) et
--    `cancelToken` (lien d'annulation email, unique).
-- 2. Index unique PARTIEL anti double-booking : au plus une VRAIE réservation
--    active par créneau. Une « vraie » réservation = RDV confirmé (toute source)
--    OU RDV en attente issu du chatbot. Les souhaits `CONTACT` en attente
--    (formulaire de contact) restent des leads souples, non bloquants.
-- 3. `Unavailability` : indispos/vacances déclarées au BO (privé, REVOKE app_web).
-- NB : on NE révoque PAS l'INSERT de `app_web` sur `AppointmentRequest` — le
-- formulaire public de demande de RDV continue d'insérer ses leads souples
-- (le RETURNING reste borné à `id`, grant SELECT(id) déjà en place).
-- ──────────────────────────────────────────────────────────────────────────

-- 1. Identité + token d'annulation
ALTER TABLE "AppointmentRequest"
  ADD COLUMN "firstName"   TEXT,
  ADD COLUMN "lastName"    TEXT,
  ADD COLUMN "phone"       TEXT,
  ADD COLUMN "cancelToken" TEXT;

CREATE UNIQUE INDEX "AppointmentRequest_cancelToken_key"
  ON "AppointmentRequest" ("cancelToken");

-- 2. Anti double-booking (vraies réservations uniquement)
CREATE UNIQUE INDEX "AppointmentRequest_active_slot_key"
  ON "AppointmentRequest" ("requestedAt")
  WHERE "requestedAt" IS NOT NULL
    AND ("status" = 'CONFIRMED' OR ("status" = 'PENDING' AND "source" = 'CHATBOT'));

-- 3. Unavailability (privé, admin uniquement)
CREATE TABLE "Unavailability" (
  "id"        TEXT NOT NULL,
  "startAt"   TIMESTAMP(3) NOT NULL,
  "endAt"     TIMESTAMP(3) NOT NULL,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Unavailability_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Unavailability_startAt_endAt_idx" ON "Unavailability" ("startAt", "endAt");

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    REVOKE ALL ON TABLE "Unavailability" FROM app_web;
  END IF;
END $$;
