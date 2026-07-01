-- ──────────────────────────────────────────────────────────────────────────
-- Fix sécurité/affichage : la migration `20260629120000_testimonial_relationship_company`
-- a ajouté les colonnes d'affichage `authorCompany` et `authorRelationship` sans
-- étendre le grant SELECT par colonne du rôle `app_web`. Résultat : la page
-- publique `/temoignages` (qui lit ces colonnes) déclenche « permission denied
-- for table Testimonial ».
--
-- On ré-applique la liste blanche complète des colonnes d'AFFICHAGE lisibles par
-- `app_web` (jamais e-mail, IP, user-agent, ni le texte original `submittedContent`).
-- Le principe de moindre privilège est préservé : seules les colonnes affichées
-- publiquement sont accordées.
-- ──────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
    GRANT SELECT (
      "authorCompany", "authorRelationship"
    ) ON TABLE "Testimonial" TO app_web;
  END IF;
END $$;
