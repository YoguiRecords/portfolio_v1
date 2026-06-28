# PROGRESS — Portfolio Yohan Debusscher

**Version courante : v0.3.0** (outillage test + DB agenda/média/programmation + home publique —
voir `docs/patch_notes/patch_note_V0_3.md`).

## État courant
Infra Docker complète + **auth back office** + **outillage de test partagé** + **schéma de contenu
complet** + **page d'accueil publique rendue depuis la DB**. Tout reste **vert** :
typecheck + lint + **35 tests Vitest** + **2 tests Playwright (E2E)**.

## Stack en place
- Monorepo **pnpm** : `apps/web` (public), `apps/admin` (back office), `packages/db` (Prisma),
  `packages/core` (types/utils + logique partagée), `services/converter`.
- **Next.js 16.2.9** (App Router, RSC, TS strict), **Tailwind v4**, React 19.2.
- **Prisma 7.8** (générateur `prisma-client` ESM + adapter `@prisma/adapter-pg`).
- **Tests** : Vitest 4 (config partagée node + jsdom/RTL), DB de test isolée (schéma `test`),
  factories, mock LLM, **Playwright** (E2E) ; CI = lint·typecheck·test·build + job E2E (Postgres).

## Modèle de données (schema.prisma)
- **Identité** : Profile (singleton, hero/CV/SEO) + SocialLink.
- **Contenu home** : SiteSettings, HomeSection, Kpi, Skill, CareerTrack/Milestone, CareerGoal,
  Analysis (SWOT/PESTEL/PORTER) + AnalysisItem, FaqEntry.
- **Projets** : Project (+ type, blocs `ProjectBlock`, liens, images), Technology.
- **News** : Article (statuts DRAFT/**SCHEDULED**/PUBLISHED, `scheduledAt`, lien évènement, galerie).
- **Agenda** : Event (date/lieu/online/inscription externe, visibilité, programmable), EventMedia.
- **Médias** : MediaAsset (IMAGE/**VIDEO**/**EMBED**, dimensions optionnelles, provider/externalUrl/poster).
- **Modération / inbox** : Testimonial (PENDING/APPROVED/REJECTED), ContactMessage, **AppointmentRequest**.
- **Auth** : AdminUser (argon2id, TOTP), Session (opaque), LoginAttempt.

## Sécurité DB (moindre privilège)
- `app_web` : lecture seule du contenu public + **INSERT seul** sur `ContactMessage`,
  `Testimonial` (sans PII ni statut) et **`AppointmentRequest`** (jamais de lecture).
- `app_admin` : lecture/écriture cantonnée. Tables d'auth `REVOKE`d pour `app_web`.

## Site public (`apps/web`)
- **Home complète depuis la DB**, ordonnée par `HomeSection` (sections masquées/omises si sans
  données) : hero (typewriter sans saut), profil (KPI + analyses), écosystème (orbit), parcours
  (timeline des 4 voies), cap (objectifs), projets (scènes → `/projets/[slug]`).
- DA « éditorial sombre + or » (`app/globals.css`, tokens portés des maquettes). Aucun contenu en dur.
- Loader groupé `lib/data/home.ts` (`select` explicites, filtres `PUBLISHED`/`isVisible`).
- Rendu **dynamique** (SSR par requête) → pas de dépendance DB au build (CI build sans DB).

## Infra Docker (8 services, durcie)
proxy (Caddy, seul exposé 443/8090), web, admin, **image-processor** (webp+EXIF, Flask+Pillow,
réutilisé d'OXO — remplace l'ancien converter Node), minio (media public), db (Postgres, rôles
séparés), umami. Réseaux `edge`/`internal`. Reste : retirer `services/converter` (mort), clé MinIO
scopée, prod (db hors edge), diagnostiquer `minio-init`.

## Avatar / médias
- Photo de profil convertie en webp (sharp, manuel) et poussée dans **MinIO** (`media/profile.webp`,
  lecture publique). `MediaAsset` créé + `Profile.avatar` lié (URL pilotée par `MEDIA_PUBLIC_BASE_URL`).
  Affichée dans le hero (duotone or) ; monogramme en fallback si pas d'avatar. À re-générer via
  `image-processor` une fois l'upload BO (P11) livré.

## Ports (dev local)
`web` 3100 · `admin` 3101 · umami 3102 · minio 9100/9101 · proxy 8090 · db 5436.

## Site public — fiches projet (P3)
- `/projets/[slug]` rendue depuis la DB (publiés only, 404 propre). **Renderer de blocs modulaires**
  (12 types, `data` JSON validé Zod `@portfolio/core`, fail-safe). Hero d'étude de cas + nav suivant.
  1 composant + CSS Module par bloc (standard `CODE-STANDARDS`).

## Site public — News & Agenda (P4)
- Pages `/actus` + `/agenda` (liste + détail) depuis la DB ; markdown **sûr** (zéro injection HTML),
  galerie image/vidéo/embed. Cron de publication programmée dans `admin` (`/api/cron/publish`,
  protégé `CRON_SECRET`, rôle `app_admin`). i18n `[locale]` reportée à Pi18n.

## Dernière livraison
- **v0.3.2** (P4) : News + Agenda + cron de publication. **53 tests** verts (core 16, db 3, admin 14,
  web 20) — stabilisés (single-fork pour les suites DB) ; E2E news + agenda. Poussée sur `llm`.

## Prochaines étapes
Voir `TASKS.md` — suite des plans : **P3** (fiches projet), P4 (news/agenda), Pi18n, P5 (témoignages),
P6 (contact), P7 (SEO/AEO), P8–P13 (back office), P14/P15 (IA), P16 (réseaux, plan only).
