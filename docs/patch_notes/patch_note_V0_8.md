# Patch notes — v0.8.x

## v0.8.0 — 2026-07-01 — CV dynamique (corpus unique → 3 projections + PDF auto)

Le CV devient un **contenu dynamique éditable au back office**, projeté sur **trois surfaces**
(home, page `/cv` riche, **PDF A4** figé), **bilingue FR/EN**, avec génération PDF automatisée par un
conteneur headless durci. Le lien « Le CV » du site ne mène plus à un **404**.

### Données (PR1)
- Nouvelles entités : `Experience`, `Education`, `Language`, `Interest`, `CvExport` (PDF généré, une
  ligne par locale). Extensions : `Profile` (accroche/disponibilité CV), `Skill` (`kind` TECH/SOFT,
  `showOnCv`), `Project` (`showOnCv`, `cvBadge`), `Kpi` (`showOnCv`).
- Drapeaux d'inclusion par surface (`showOnPdf` / `showOnCvPage` / `showOnSite`). Migration additive
  (site intact) ; `app_web` reçoit `SELECT` via les *default privileges* du rôle propriétaire.

### Back office (PR2)
- Écrans CRUD `/experiences`, `/formations`, `/langues`, `/interets` avec **réordonnancement par
  glisser-déposer** (`@dnd-kit/sortable`, composant réutilisable `components/ui/sortable-list.tsx`).
- Écrans existants étendus : compétences (kind/catégorie/showOnCv), KPI (showOnCv), éditeur projet
  (showOnCv/cvBadge), profil (champs CV). Schémas Zod par entité (`@portfolio/core`).

### Document A4 (PR3)
- `CvDocument` : reproduction fidèle d'un CV A4 « éditorial sombre + or », **data-driven**
  (projection `showOnPdf`), **bilingue**. Rendu sur la route interne `admin /internal/cv-document`
  (hors chrome BO, **garde par token**, jamais routée par Caddy). Inter **self-hosté** (`next/font`,
  aucun appel CDN au runtime).

### Service & génération PDF (PR4)
- **Nouveau service Docker `cv-renderer`** (8ᵉ) : Chromium headless (Playwright), **durci** (non-root,
  FS read-only + `tmpfs`, `no-new-privileges`, aucun port publié, réseau interne sans Internet).
- `generateCvPdfAction` (admin authentifiée) : rend FR + EN, upload MinIO (nom randomisé), upsert
  `CvExport`. Panneau BO « Générer le PDF » + « dernier généré le… » + téléchargement.
- `proxy.ts` exempte `/internal` (protégé par token, pas par session). Image ajoutée à la CI Docker.

### Page publique (PR5)
- Page `/cv` **bilingue** et **responsive** (DA home réutilisée) : projection riche (descriptions
  longues, toutes expériences/projets) + boutons **« Télécharger le PDF »** (FR/EN) servant les PDF
  figés. Lien hero « Le CV » localisé (`/cv` ↔ `/en/cv`). **Tue le 404.**

### Notes
- i18n : champs scalaires via l'overlay `Translation` existant ; les champs tableaux (puces, stack)
  restent FR pour l'instant.
- **Prod** : définir `CV_RENDER_TOKEN` (route interne fermée par défaut sans token) et
  `MEDIA_PUBLIC_BASE_URL` (domaine public).
