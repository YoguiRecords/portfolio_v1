# PROGRESS — état courant

> État du projet à l'instant T (réécrit à chaque fin de session, pas d'historique cumulé).
> Historique versionné → `docs/patch_notes/`.

## Version
- **Cycle en cours :** refonte UI du back office (« BO v2 »).
- **Dernier jalon livré :** **P3 — Projets** (liste DataTable CRUD + éditeur entête + aperçu live réutilisable).

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
- Exécuter **Phase 4 — Articles** (`docs/plans/2026-06-29-phase-04-articles.md`) : liste conforme + éditeur markdown (réutilise `live-preview`) + publication programmée (SCHEDULED/scheduledAt) + tags/catégorie/SEO.
- **Phase ajoutée** : **P17 — Chatbot public IA** (rendre fonctionnel le chatbot existant) — `docs/plans/2026-06-30-phase-17-public-chatbot.md`.
- **Validation visuelle** : stratégie consignée dans `resume.md` (D06) — harnais screenshots authentifié consolidé en P15.

## Livré (résumé)
- **P0** — Tokens `@theme` (graphite + or + statuts + rayons) + 18 primitives UI testées dans `apps/admin/components/ui/` (barrel `@/components/ui`).
- **P1** — Shell v2 : `components/admin-layout/{rail,topbar,mobile-bar,icons}.tsx`, modèle nav groupé `components/admin-nav/admin-nav.tsx`, compteurs `lib/data/nav-badges.ts`. Rail desktop (icônes + tooltips + groupes Contenu/Relation client/Mesure), topbar (search ⌘K placeholder, notif, Créer, avatar), bottom bar mobile + tiroir nav complet.
- **P2** — Dashboard v2 : `lib/data/dashboard.ts` (agrégation) + `lib/data/traffic.ts` (Umami, fallback si non configuré), `components/dashboard/{traffic,content-to-treat,top-content}-panel.tsx`, page `app/(dashboard)/page.tsx`. KPIs + trafic + à-traiter + top contenus. (Ancien `dashboard-stats` supprimé.)
- **P3** — Projets v2 : `components/live-preview/*` (aperçu réutilisable), `components/projects/{projects-list,project-editor,project-preview}.tsx`, action `updateProjectAction`, pages `projets/{page,[id]/page}.tsx`. Liste DataTable (recherche/filtre/pagination/suppression confirmée), éditeur entête + aperçu live, blocs préservés.
- Gate vert : 113 tests, `tsc --noEmit` OK, lint 0 erreur, `next build` OK.

## Garde-fous (rappel)
- Travail sur `llm`, PR `llm → dev` (revue humaine). Jamais de push direct `dev`/`main`.
- Sécurité d'abord : Zod aux frontières, rôles DB (`app_admin`), nouveaux modèles REVOKE pour `app_web`, pas de secret en dur.
