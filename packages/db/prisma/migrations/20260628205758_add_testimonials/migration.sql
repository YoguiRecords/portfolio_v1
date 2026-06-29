-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorRole" TEXT,
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "submittedContent" TEXT NOT NULL,
    "rating" INTEGER,
    "status" "TestimonialStatus" NOT NULL DEFAULT 'PENDING',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ip" TEXT,
    "userAgent" TEXT,
    "avatarId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Testimonial_status_order_idx" ON "Testimonial"("status", "order");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ──────────────────────────────────────────────────────────────────────────
-- Sécurité : table Testimonial (témoignages modérés).
-- Le site public (`app_web`) peut SOUMETTRE un témoignage (INSERT) mais :
--   • ne LIT que les colonnes d'affichage (jamais e-mail, IP, user-agent, ni le
--     texte original `submittedContent`) → grant SELECT par colonne ;
--   • n'a NI UPDATE NI DELETE → il ne peut pas modérer (accepter/refuser/éditer).
-- La modération se fait exclusivement via `app_admin` (back office). Le filtrage
-- `status = 'APPROVED'` est appliqué par l'app côté `web`.
-- NB : `web` doit utiliser un `select` explicite (les colonnes non accordées ne
-- sont pas lisibles — sur-fetch de PII impossible par construction).
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    REVOKE ALL PRIVILEGES ON TABLE "Testimonial" FROM app_web;
    GRANT INSERT ON TABLE "Testimonial" TO app_web;
    GRANT SELECT (
      "id", "authorName", "authorRole", "content", "rating",
      "status", "isFeatured", "order", "avatarId", "createdAt", "approvedAt"
    ) ON TABLE "Testimonial" TO app_web;
  END IF;
END $$;
