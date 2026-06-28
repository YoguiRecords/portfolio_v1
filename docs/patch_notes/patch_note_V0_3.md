# Patch notes — v0.3.x

## v0.3.3 — Témoignages (affichage + soumission modérée) (2026-06-29)

- Page `/temoignages` : affichage des témoignages **APPROVED** via un `select` sûr
  (**zéro PII** — jamais email/IP/texte original), + formulaire public de soumission.
- Soumission → Route Handler `POST /api/testimonials` : **rate-limit** (3/h/IP) + **honeypot**
  + validation **Zod**, stocké en `PENDING` (jamais auto-validé ; modération BO en P13).
- Modules réutilisables (`TestimonialCard`, `TestimonialForm` client) + util **rate-limiter**
  in-memory et schéma partagés (`@portfolio/core`). Tests unit + E2E.
- Fix infra test : exécution **sérialisée** des suites (`--workspace-concurrency=1`) pour éviter
  les races sur le schéma `test` partagé entre packages.

## v0.3.2 — News, Agenda & publication programmée (2026-06-29)

- **Pages News** (`/actus`, `/actus/[slug]`) et **Agenda** (`/agenda`, `/agenda/[slug]`) rendues
  depuis la DB (publiés/publics uniquement) ; actus programmées masquées tant que non échues.
- **Module Markdown sûr** (rendu en éléments React, **aucune injection HTML** ; liens limités à
  http(s)/mailto/relatif). **Module Gallery** (image/vidéo/embed, sources http only, lazy, ratios fixes).
- Détail évènement : bouton **« S'inscrire »** → lien externe `rel="noopener noreferrer"`.
- **Cron de publication** (`apps/admin`, `POST /api/cron/publish`) protégé par `CRON_SECRET` :
  bascule `SCHEDULED → PUBLISHED` (articles + évènements échus) avec le rôle `app_admin` (écriture).
- Modules réutilisables (CSS Modules) ; loaders testés sur la DB isolée. E2E news + agenda.
- Note : i18n `[locale]` reportée à **Pi18n** (P4 livré en FR sur `/actus`/`/agenda`).

## v0.3.1 — Fiches projet (étude de cas par blocs) (2026-06-29)

- **Page projet** `/projets/[slug]` rendue depuis la DB (rôle `app_web`, publiés uniquement),
  404 propre sur slug inconnu/non publié.
- **Renderer de blocs modulaires** : 12 types (`CONTEXT`, `PROCESS`, `ANALYSIS`, `GAME_DESIGN`,
  `ARCHITECTURE`, `SECURITY`, `DESIGN_UX`, `METRICS`, `RECOMMENDATIONS`, `RESULTS`, `GALLERY`,
  `TEXT`), chaque `data` JSON **validé par un schéma Zod** partagé (`@portfolio/core`) ; bloc
  invalide/inconnu → ignoré (fail-safe, jamais de throw). 1 composant + CSS Modules par bloc.
- **Hero d'étude de cas** (type, titre, standfirst, méta, sig, tags, cover) + nav « projet suivant ».
- **Image-processor** (convertisseur webp réutilisé d'OXO) remonté sur le Docker portfolio (interne).
- Tests : +schémas blocs (4), loader projet (2), renderer (1) ; E2E : home→projet + 404.

## v0.3.0 — Outillage de test, DB agenda/média/programmation & home publique (2026-06-29)

Trois livraisons de la construction du portfolio : l'outillage de test partagé (P0), le
complément du schéma DB (P1) et la **page d'accueil publique rendue depuis la DB** (P2).

### Outillage de test (P0)
- Config **Vitest partagée** (`vitest.shared.ts` node, `vitest.web.ts` jsdom + RTL).
- **Base de données de test isolée** : schéma Postgres `test` dédié (`.env.test` git-ignoré),
  client de test (`makeTestClient`), reset par TRUNCATE entre tests, factories de fixtures.
  > Le driver adapter `pg` ignore le paramètre `?schema=` de l'URL : `makeTestClient`
  > passe désormais le schéma explicitement (sinon les écritures de test ciblaient `public`).
- **Mock LLM** déterministe (`mockLlm`) + port `Llm` abstrait pour P14/P15 (aucune clé requise).
- **Playwright** E2E (config + smoke) ; CI étendue (service Postgres + job E2E).

### Base de données (P1)
- Nouveaux modèles : `Event` (agenda : date/lieu, en ligne, lien d'inscription externe,
  visibilité public/privé, publication programmable), `EventMedia`, `ArticleMedia`,
  `AppointmentRequest` (demandes de RDV).
- Médias **vidéo/embed** : `MediaAsset.kind` (IMAGE/VIDEO/EMBED) + `provider`/`externalUrl`/
  `posterUrl`/`durationSec` ; `width`/`height` rendus optionnels.
- **Publication programmée** : `ArticleStatus.SCHEDULED` + `Article.scheduledAt`, logique pure
  testée (`isDue`/`splitDue`), lien actu ↔ évènement.
- Sécurité : `app_web` peut **INSÉRER** une demande de RDV mais jamais la **LIRE**
  (grant de moindre privilège, comme `ContactMessage`).

### Site public — page d'accueil (P2)
- `apps/web` rend une **home complète depuis la DB** (rôle lecture `app_web`), ordonnée par
  `HomeSection` : hero (typewriter sans saut), profil (KPI + SWOT/PESTEL/PORTER), écosystème
  (orbit compétences/projets), parcours (timeline des voies), cap (objectifs), projets (scènes).
- **Aucun contenu en dur** : chaque section lit ses données ; une section sans données est omise.
- DA « éditorial sombre + or » portée depuis les maquettes (tokens, nav/burger, footer).
- Loader groupé (`getHomeData`) avec `select` explicites et filtres `PUBLISHED`/`isVisible`.

### Tests
- Vitest : **35 tests** (core 12, db 3, admin 13, web 7) — loaders, composants (RTL),
  logique de programmation, intégration DB sur le schéma isolé.
- Playwright : smoke + la home affiche le contenu seedé.

### Dépendances ajoutées
- `@playwright/test`, `@testing-library/react`/`jest-dom`/`user-event`, `jsdom`, `dotenv-cli`,
  `vitest` (outillage, racine).
