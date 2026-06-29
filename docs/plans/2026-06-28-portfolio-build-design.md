# Design — Construction du portfolio (web + admin + IA)

> Doc de design validé (brainstorming) servant de référence aux plans de dev.
> **Périmètre évolutif** : de nouveaux éléments seront ajoutés ; chaque ajout
> donne lieu à un plan `P-xx` supplémentaire, sans casser l'ordre ci-dessous.
> Branche de travail : `llm`. Sécurité d'abord. TDD obligatoire.

## 1. État de départ (déjà fait)

- **DB** (`packages/db`) : schéma complet du contenu éditable **migré + seedé**
  (Profile, KPI, Skill, CareerTrack/Milestone, CareerGoal, Analysis
  SWOT/PESTEL/PORTER, Project + ProjectBlock flexibles, ProjectLink, FAQ,
  SiteSettings, HomeSection, Testimonial modéré, ContactMessage). Grants de
  moindre privilège en place (`app_web` lecture publique + INSERT
  contact/témoignage sans PII ni auto-validation).
- **Auth back office** (`apps/admin/lib/auth` + `packages/core/src/auth`) :
  argon2id, TOTP/MFA, sessions opaques, throttle, guards — **fait et testé**.
- **Tests** : Vitest déjà utilisé (auth). **Pas** de Playwright ni de config E2E.
- **`apps/web`** : coquille vide (layout/page).
- **Maquettes** : `mockups/site-v3.html` (référence) + 4 fiches projet par type.

## 2. Architecture cible

- **Lecture publique** : `apps/web` en **Server Components**, lit la DB via
  `@portfolio/db` avec le rôle **`app_web`** (lecture seule + INSERT
  contact/témoignage). Toujours filtrer (`status = PUBLISHED` / `APPROVED`) et
  utiliser un **`select` explicite** (pas de sur-fetch de PII).
- **Écriture** : `apps/admin` via **Server Actions** (rôle `app_admin`),
  validation **Zod** à la frontière. Schémas Zod partagés dans `@portfolio/core`.
- **UI** : composants extraits de `site-v3` (tokens DA, aucun contenu en dur).
- **SEO/AEO** : Next Metadata API + **JSON-LD** (Person, CreativeWork, Article,
  FAQPage, BreadcrumbList) + `app/sitemap.ts` + `app/robots.ts` + route
  **`/llms.txt`** (depuis `SiteSettings`). OG/Twitter par contenu.
- **Médias** : upload `admin` → converter (webp + strip EXIF) → MinIO → URL en
  DB. Vidéos : stockage direct/embed (contournent webp), via `MediaKind`.
- **IA (OpenRouter)** : SDK OpenAI pointé sur la base URL OpenRouter, clé en
  `.env` (jamais committée). Contexte = données DB injectées (corpus petit → pas
  de vecteurs). System prompt à **garde-fous** : toujours mettre Yohan en avant,
  jamais citer un concurrent ; **function-calling** → crée un `AppointmentRequest`
  (PENDING, confirmé au BO). **Rate-limit + plafond de tokens** obligatoires.

## 3. Stratégie de test (TDD, AAA)

- **Unitaire** (Vitest + RTL) : schémas Zod, services/mappers, logique
  (publication programmée, garde-fous IA), composants (comportement).
- **E2E** (Playwright) : parcours public (home, projet, news, contact,
  témoignage) + parcours BO (login MFA, CRUD, modération). DB de test dédiée,
  **LLM mocké**, services externes mockés.
- Règle : tests écrits **avant** l'implémentation ; verts = porte de passage.

## 4. Découpage des plans (ordre d'exécution)

| Plan | Sujet | Dépendances externes |
|---|---|---|
| `P0` | Outillage tests : Playwright, config Vitest partagée, fixtures DB, mock LLM, helpers | `@playwright/test` |
| `P1` | DB restante : Agenda/Événements, média vidéo/embed, publication programmée, RDV (migration + grants + seed) | — |
| `P2` | Web : layout/nav/footer + sections home depuis la DB | — |
| `P3` | Web : fiches projet (blocs modulaires, 4 types) | — |
| `P4` | Web : News/Articles + Agenda/Événements | — |
| `P5` | Web : Témoignages (affichage approuvés + formulaire de soumission) | — |
| `P6` | Web : Formulaire de contact (Route Handler, Zod, rate-limit, honeypot) | — |
| `P7` | Web : SEO/AEO (metadata, sitemap, robots, llms.txt, JSON-LD, FAQPage, OG) | — |
| `P8` | Admin : garde des routes + shell BO (nav, layout) | — |
| `P9` | Admin : CRUD contenu home (Profile, SiteSettings, HomeSection, KPI, Skill, Career*, Analysis, Goal) | — |
| `P10` | Admin : Projets + éditeur de blocs | — |
| `P11` | Admin : Articles (+ publication programmée) + upload média | converter/MinIO |
| `P12` | Admin : Agenda/Événements (+ génération d'actu depuis évènement, manuelle) | — |
| `P13` | Admin : Modération témoignages + inbox contact/RDV | — |
| `P14` | IA : assistant de rédaction d'actus au BO (OpenRouter) | clé OpenRouter, SDK |
| `P15` | IA : chatbot public + RDV + garde-fous (OpenRouter) | clé OpenRouter, SDK, rate-limit |
| `P16` | Réseaux : auto-post multi-réseaux + stats — **PLAN ONLY (non exécuté)** | OAuth réseaux |

## 5. Risques & décisions

1. **Exécution nocturne autonome** : les plans sont écrits maintenant ; leur
   exécution non-supervisée nécessite un **runner** (`/loop` + executing-plans).
   À lancer après rédaction des plans.
2. **OpenRouter** : `P14`/`P15` écrits sans la clé, exécutables dès qu'elle est
   dans `.env`. Aucune clé committée.
3. **Publication programmée** : nécessite un **déclencheur temporel** (cron léger
   ou revalidation à la demande) — détaillé dans `P1`/`P11`.
4. **Réseaux** (`P16`) : non testable → **plan documenté uniquement**.
5. **Nouvelles dépendances** validées via ce design : `@playwright/test`, SDK
   OpenAI (OpenRouter), un rate-limiter léger.

## 6. Conventions

- Commits **atomiques** Conventional Commits sur `llm`, un commit par étape verte.
- Aucun secret en dur ; `.env` git-ignoré.
- Doc mise à jour en fin de livraison (PROGRESS, TASKS, patch notes,
  ARCHITECTURE/SECURITY si impactés).
