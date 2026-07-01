# PROGRESS — état courant

> État du projet à l'instant T (réécrit à chaque fin de session, pas d'historique cumulé).
> Historique versionné → `docs/patch_notes/`.

## Version
- **Cycle en cours :** refonte UI du back office (« BO v2 ») + features web.
- **Dernier correctif :** **v0.8.2 — chatbot activable + FAQ publique** : clé OpenRouter câblée
  (web/admin), toggle d'activation + config (modèle/persona/budget) au BO (`/ai`), garde-fou budget
  effectif (migration `20260701000200`). Page **`/faq`** (FAQPage JSON-LD) + FAQ projet/article
  visibles. Dimensions média persistées, Gantt mobile corrigé. Validé navigateur (chat LLM réel,
  budget décompté). Détail : `docs/patch_notes/patch_note_V0_8.md`.
- **Correctif précédent :** **v0.8.1 — recette QA** : passe complète (tous CRUD BO + fonctionnalités
  web + responsive 4 breakpoints). 4 fixes : droits `app_web` sur les **formulaires publics**
  (`/temoignages` 500, contact & RDV KO → migrations `20260701000000` / `20260701000100` +
  `select:{id:true}`), **édition projet 500** (`ProjectInput` `.nullish()`), cases visibilité au
  **formulaire d'ajout formation**. Détail : `docs/patch_notes/patch_note_V0_8.md`.
- **Dernier jalon livré :** **v0.8.0 — CV dynamique** : corpus unique éditable au BO → 3 projections
  (home, page `/cv` riche, **PDF A4** figé), bilingue FR/EN, génération PDF via le service durci
  **`cv-renderer`** (8ᵉ service). **404 `/cv` tué.** 6 PRs (#18→#22). Détail : `docs/patch_notes/patch_note_V0_8.md`.
  Validé navigateur (BO CRUD + drag-reorder, route interne FR/EN, pipeline PDF réel, page `/cv` desktop/mobile).
- **Jalon précédent :** **v0.7.0 — « Le cap » : trajectoire ascendante** (web) + édition/réordonnancement
  des objectifs (BO). Détail : `docs/patch_notes/patch_note_V0_7.md`.
- **Prochain plan :** — (backlog dans `TASKS.md`).

## Où on en est
- **Direction visuelle BO validée :** `v2` — menu **rail** à icônes, palette **noir/gris graphite + or**, **Dashboard** (portfolio/audience) distinct de **Mission Control** (relation client/à-faire), éditeurs avec **aperçu live réduit & fermable**.
  - Maquettes : `mockups/bo/v2/*` ; design-system de réf. : `mockups/bo/assets/bo.css`.
- **Plans écrits :**
  - Feuille de route maîtresse : `docs/plans/2026-06-29-bo-v2-roadmap.md` (16 phases P0→P15).
  - Plans détaillés par phase : `docs/plans/2026-06-29-phase-NN-*.md`.
- **Backlog actionnable :** `TASKS.md`.
- **Implémentation :** **non démarrée** (le BO réel `apps/admin` est déjà fonctionnel mais à l'ancienne DA — c'est ce qu'on met en conformité).

## Décisions verrouillées
1. **Mail** = Microsoft Graph (intégration existante).
2. **Boîte de réception unique = Mails + Messages** (même geste : répondre ou pas). **RDV à part** (accepter/refuser → agenda).
3. **CRM complet** (Contacts + Sociétés + Deals/pipeline + activités/relances).
4. **Tout le BO** mis en conformité, **par phases**.

## Prochaine action (suite — câblage & dettes, plans prêts)
- **P16 DT8** : câbler le RBAC (le moteur est livré+testé) — `requirePermission` sur chaque page/action,
  filtre nav, UI gestion comptes (`/utilisateurs`), onboarding invitation, login `isActive`, zxcvbn.
- **Chatbot** : toggle d'activation au BO + câblage outil RDV.
- Dettes mineures (DT1–DT7) listées dans `resume.md`.
- **Quand prêt :** revue humaine + merge de la PR `llm → dev`.
- **Phase ajoutée** : **P17 — Chatbot public IA** (rendre fonctionnel le chatbot existant) — `docs/plans/2026-06-30-phase-17-public-chatbot.md`.
- **Validation visuelle** : stratégie consignée dans `resume.md` (D06) — harnais screenshots authentifié consolidé en P15.

## Livré (résumé)
- **P0** — Tokens `@theme` (graphite + or + statuts + rayons) + 18 primitives UI testées dans `apps/admin/components/ui/` (barrel `@/components/ui`).
- **P1** — Shell v2 : `components/admin-layout/{rail,topbar,mobile-bar,icons}.tsx`, modèle nav groupé `components/admin-nav/admin-nav.tsx`, compteurs `lib/data/nav-badges.ts`. Rail desktop (icônes + tooltips + groupes Contenu/Relation client/Mesure), topbar (search ⌘K placeholder, notif, Créer, avatar), bottom bar mobile + tiroir nav complet.
- **P2** — Dashboard v2 : `lib/data/dashboard.ts` (agrégation) + `lib/data/traffic.ts` (Umami, fallback si non configuré), `components/dashboard/{traffic,content-to-treat,top-content}-panel.tsx`, page `app/(dashboard)/page.tsx`. KPIs + trafic + à-traiter + top contenus. (Ancien `dashboard-stats` supprimé.)
- **P3** — Projets v2 : `components/live-preview/*` (aperçu réutilisable), `components/projects/{projects-list,project-editor,project-preview}.tsx`, action `updateProjectAction`, pages `projets/{page,[id]/page}.tsx`. Liste DataTable (recherche/filtre/pagination/suppression confirmée), éditeur entête + aperçu live, blocs préservés.
- **P4** — Articles v2 : `components/markdown/markdown.tsx` (renderer sûr admin), `components/articles/{articles-list,article-editor,article-preview}.tsx`, action `updateArticleAction`, pages `articles/{page,[id]/page}.tsx`. Liste DataTable + filtres statut + éditeur markdown + aperçu live + programmation (SCHEDULED/scheduledAt).
- **P5** — Profil/Home/CV : `app/(dashboard)/profile/profile-form.tsx` (contrôlé + aperçu live), `components/profile/about-preview.tsx`, `content/page.tsx` reskin (sections+KPIs), `components/cv/cv-editor.tsx` + `app/(dashboard)/cv/page.tsx` (iframe `sandbox` srcDoc), action `updateCvHtmlAction`, entrée nav `/cv`.
- **P6** — Médias v2 : `components/media/{dropzone,media-grid}.tsx`, page `media/page.tsx`. Dropzone (validation client + pipeline serveur inchangé), grille + panneau détails (dimensions/poids/format/durée/alt), support VIDEO/EMBED.
- **P7** — Témoignages v2 : `components/testimonials/testimonials-list.tsx`, page `temoignages/page.tsx`. Onglets statut, édition `content` (audit `submittedContent` préservé), mise en avant, refus confirmé, hook CRM stub (P11).
- **P8** — Agenda + RDV : `components/rdv/rdv-list.tsx`, pages `rdv/page.tsx` + `agenda/page.tsx` reskin ; `confirmAppointmentWithEvent` (moderation.ts) crée un évènement calendrier (best-effort via `getCalendar()`), confirm/decline. RDV hors inbox.
- **P9** — Inbox unifiée : `lib/inbox/aggregate.ts` (+ test résilience), `components/inbox/inbox-list.tsx`, pages `/inbox` + `/inbox/[source]/[id]` (réponse via `mail-reply-form`/Graph). Nav : « Boîte de réception » remplace Mails+Messages (routes conservées).
- **P10** — CRM socle : modèles Prisma + migration `20260630120000_crm` (REVOKE `app_web`, validée test DB), `packages/core/src/crm/schemas.ts` (Zod), `apps/admin/lib/crm/crm.ts` + `lib/actions/crm-actions.ts` (CRUD + guard). Liens cross-domaine en IDs souples. `SECURITY.md` mis à jour.
- **P11** — CRM UI : `components/crm/{contacts-table,pipeline-board}.tsx`, pages `contacts/{page,[id]/page}` (fiche 360° deals/activités/tâches), `societes/page`, `pipeline/page` (board + déplacement par select). Nav : Contacts/Sociétés/Pipeline.
- **P12** — Mission Control : `lib/data/mission-control.ts` (+ test) + page `mission-control/page.tsx`. KPIs relation client, pipeline (groupBy), tâches, à-traiter, aperçu inbox. Entrée nav en-tête.
- **P13** — Reskin DA v2 des pages `/ai` (Assistant IA) et `/calendrier` (tokens ; logique inchangée).
- **P14** — `components/command-palette/command-palette.tsx` (⌘K global, monté dans le layout, ouvert par la topbar), reskin `settings-form.tsx` + `faq/page.tsx`.
- **P15** — Docs finales (`ARCHITECTURE`/`API_REFERENCE` + section BO v2/CRM), patch note `docs/patch_notes/patch_note_V0_5.md`, E2E `e2e/bo-v2.spec.ts` (guard des routes BO).
- **P16 (socle)** — Migration `20260630130000_rbac` (AdminUser RBAC + AdminInvite, REVOKE app_web). Core `auth/{permissions,password-policy}` (+ tests). Gardes `requirePermission`/`requireOwner`/`assertCanWrite` (guards.ts) + `/403` + `lib/privacy/mask.ts`. **Suite = DT8** (voir resume.md).
- **P17** — Chatbot public fonctionnel : `route.ts` (events à venir), `chat-context.ts` (prochain évènement), `chat-widget.tsx` (prop `enabled`), `[locale]/layout.tsx` (lit `isPublicChatEnabled`). Modèle `openrouter/fusion`.
- **Todo-list unifiée** — modèle Prisma **`Task`** générique (rename `CrmTask` via `@@map("CrmTask")`, migration `20260630140000_task_unify` **data-preserving** : `isDone→status`, liens→`CRM`). `@portfolio/core` : `TaskInput` + constantes catégorie/statut/priorité. Service `lib/crm/crm.ts` (`createTask`/`updateTask`/`setTaskStatus`/`deleteTask`) + actions `crm-actions.ts`. Page **`/taches`** (`components/crm/task-board{,-view}.tsx` : kanban 4 colonnes **drag & drop** `@dnd-kit` — souris/tactile/clavier, optimistic UI + Server Action ; board client-only `next/dynamic ssr:false` ; filtres catégorie + « du jour », drawer création/édition + suppression). Mission Control → **tâches du jour** (`status != DONE`, échéance = aujourd'hui) + lien `/taches`. Fiche contact passée au workflow `status` (création en catégorie `CRM`). E2E guard `e2e/taches.spec.ts`.
- Gate vert : 156 admin + 63 core tests, `tsc` OK (admin/core), lint 0 erreur. Migration appliquée sur la DB locale.

## Garde-fous (rappel)
- Travail sur `llm`, PR `llm → dev` (revue humaine). Jamais de push direct `dev`/`main`.
- Sécurité d'abord : Zod aux frontières, rôles DB (`app_admin`), nouveaux modèles REVOKE pour `app_web`, pas de secret en dur.
