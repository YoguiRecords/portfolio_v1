# PROGRESS — état courant

> État du projet à l'instant T (réécrit à chaque fin de session, pas d'historique cumulé).
> Historique versionné → `docs/patch_notes/`.

## Version
- **Cycle en cours :** refonte UI du back office (« BO v2 »).
- **Dernier jalon livré :** **P9 — Boîte de réception unique** (Mails Graph + Messages de contact, réponse email).

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

## Prochaine action
- Exécuter **Phase 10 — CRM : schéma & socle (SENSIBLE)** (`docs/plans/2026-06-29-phase-10-crm-schema.md`) : modèles Prisma (Contact/Company/Deal/Activity/Task) + **migration REVOKE app_web** + actions Zod. ⚠️ Phase à risque (DB + rôles) — choix loggués dans `resume.md`.
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
- Gate vert : 139 tests, `tsc --noEmit` OK, lint 0 erreur, `next build` OK.

## Garde-fous (rappel)
- Travail sur `llm`, PR `llm → dev` (revue humaine). Jamais de push direct `dev`/`main`.
- Sécurité d'abord : Zod aux frontières, rôles DB (`app_admin`), nouveaux modèles REVOKE pour `app_web`, pas de secret en dur.
