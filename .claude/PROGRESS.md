# PROGRESS — Portfolio Yohan Debusscher

**Version courante : v0.6.0** (cadres d'analyse du profil refondus : SWOT / 4P / Golden Circle /
Ikigai, éditables au BO et rendus animés sur le web — voir `docs/patch_notes/patch_note_V0_6.md`).

## État courant
Infra Docker complète + **back office v2 (DA graphite + or appliquée)** + **CRM** + **chatbot public** +
**outillage de test partagé**. Mutualisation markdown via `@portfolio/ui`. Migrations DB appliquées
automatiquement (service `migrate`). Tout reste **vert** : typecheck + lint + **266 tests Vitest** +
E2E (guard des routes BO).

## Stack en place
- Monorepo **pnpm** : `apps/web` (public), `apps/admin` (back office), `packages/db` (Prisma),
  `packages/core` (types/utils + logique partagée), **`packages/ui`** (parser markdown sûr partagé +
  constantes de marque), `services/image-processor`.
- **Next.js 16.2.9** (App Router, RSC, TS strict), **Tailwind v4**, React 19.2.
- **Prisma 7.8** (générateur `prisma-client` ESM + adapter `@prisma/adapter-pg`).
- **Tests** : Vitest 4 (config partagée node + jsdom/RTL), DB de test isolée (schéma `test`),
  factories, mock LLM, **Playwright** (E2E) ; CI = lint·typecheck·test·build + job E2E (Postgres).

## Modèle de données (schema.prisma)
- **Identité** : Profile (singleton, hero/CV/SEO) + SocialLink.
- **Contenu home** : SiteSettings, HomeSection, Kpi, Skill, CareerTrack/Milestone, CareerGoal,
  Analysis (cadres profil : **SWOT / 4P / Golden Circle / Ikigai**, un par type, payload `data` JSON
  validé Zod via `parseAnalysis`), FaqEntry.
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

## Infra Docker (durcie)
proxy (Caddy, seul exposé 443/8090), web, admin, **image-processor** (webp+EXIF, Flask+Pillow,
réutilisé d'OXO — remplace l'ancien converter Node), minio (media public), **minio-init** (one-shot :
crée le bucket `media` public — `Exited 0` = normal), **migrate** (one-shot : `prisma migrate deploy`
avant web/admin → anti-drift), db (Postgres, rôles séparés), umami. Réseaux `edge`/`internal`.
Reste : retirer `services/converter` (mort), clé MinIO scopée, prod (db hors edge).

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

## Site public — Témoignages (P5)
- `/temoignages` : affichage des `APPROVED` (`select` sûr, zéro PII) + formulaire de soumission
  (`POST /api/testimonials` : rate-limit 3/h/IP + honeypot + Zod → `PENDING`, jamais auto-validé).

## Bilingue FR/EN (Pi18n)
- `next-intl` : `/` FR, `/en` EN (routes sous `app/[locale]/`). Table `Translation` (overlay EN,
  fallback FR), `localize()` ; traduction IA (`translateFields`, mock en test) + re-traduction au
  save (FR change → EN réécrasé). BO : `LocalizedField`. Timeline animée du parcours **restaurée**.

## Back office (P8–P13)
- Shell gardé `(dashboard)` (session + MFA), nav, dashboard (compteurs). Édition : **Profil**,
  **KPI** (pattern réutilisable Zod + Server Actions `app_admin`), **Projets** (+ actions de blocs
  validées Zod par type), **Articles** (+ programmation), **Médias** (pipeline upload sécurisé
  image-processor→MinIO), **Agenda** (+ génération d'actu), **Modération** (témoignages),
  **Inbox** (contact, RDV). Autres écrans home (SiteSettings/HomeSection/Skill/Career*/Analysis)
  à ajouter selon le même pattern.

## IA (P14–P15)
- BO : adaptateur **OpenRouter** (clé `.env`), assistance par champ (5 actions), budget tokens,
  `AiAssistantConfig`. Public : **chatbot** (contexte public-only, garde-fous anti-injection,
  outil `book_appointment`, `/api/chat` désactivé par défaut, widget). Tout testé LLM **mocké**.

## Dernière livraison
- **v0.5.1** : **DA v2 réellement appliquée** (le BO s'affichait en blanc — boilerplate Next écrasait
  les tokens ; corrigé : base sombre graphite + or + Inter) + **purge couleurs en dur** (18 fichiers) ;
  **`@portfolio/ui`** (parser markdown sûr partagé + `BRAND` + test de drift) ; **Dockerfiles web/admin**
  (`prisma generate` avant build) ; **service `migrate`** (anti-drift DB) + migrations `crm`/`rbac`
  appliquées. **266 tests verts.** Voir `docs/patch_notes/patch_note_V0_5.md`.
- **v0.5.0** : refonte **BO v2** (design-system, CRM, inbox unifiée, Mission Control, chatbot public).
- **v0.4.8** : **mail & calendrier dans le BO** (ports `Mailbox`/`Calendar` provider-agnostiques ;
  calendrier réel DB = agenda + RDV ; mail démo + **adaptateur Microsoft Graph OAuth app-only** prêt
  à activer ; doc Azure). **144 tests Vitest + 16 E2E.** Voir `docs/technical/INTEGRATIONS.md`.
- **v0.4.7** : finitions BO/site (vrai Gantt + éditeur Gantt BO, quick-login dev, orbite, icône
  chatbot SVG, avatar singleton, i18n home + liens nav, chargement `.env` racine) + **témoignages
  enrichis** (entreprise + lien hiérarchique).
- **v0.4.6** : IA (assistance BO + chatbot public). Plans **P0–P15 livrés** ; **P16 = plan-only**.
- **Audit BO clos** : éditeurs **Sections, KPI, Compétences, Parcours, Analyses, FAQ, Réglages**,
  **Profil** (avatar + socials + dispo + résumé IA), et **éditeurs de blocs** (Gantt/CONTEXT/TEXT/
  RESULTS + JSON validé pour les autres). **i18n** branché sur toutes les sous-pages (`/en` complet).
- ℹ️ `CRON_SECRET` faible en dev — laissé tel quel sur demande (à régénérer avant prod).

## Plans livrés : **P0–P15 + Pi18n** (+ image-processor OXO, avatar MinIO). P16 = plan documenté.
> Reste (non bloquant) : écrans BO restants (même pattern), câblage `localize()` des loaders
> projet/news/agenda, E2E BO-login (TOTP), nettoyage `services/converter`, diag `minio-init`.
> Détails : `docs/HANDOFF-2026-06-29.md` + `TASKS.md`.

## Prochaines étapes
Voir `TASKS.md` — suite des plans : **P3** (fiches projet), P4 (news/agenda), Pi18n, P5 (témoignages),
P6 (contact), P7 (SEO/AEO), P8–P13 (back office), P14/P15 (IA), P16 (réseaux, plan only).
