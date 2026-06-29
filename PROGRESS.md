# PROGRESS — état courant

> État du projet à l'instant T (réécrit à chaque fin de session, pas d'historique cumulé).
> Historique versionné → `docs/patch_notes/`.

## Version
- **Cycle en cours :** refonte UI du back office (« BO v2 »).
- **Dernier jalon livré :** **P0 — Design system** (tokens `@theme` + 18 primitives UI testées).

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
- Exécuter **Phase 1 — Shell v2** (`docs/plans/2026-06-29-phase-01-shell.md`) : rail + topbar + bottom bar mobile, branchés sur les primitives `@/components/ui`.
- **Vérif navigateur** à partir de P1 (pages visibles) : lancer l'admin, captures d'écran ; Playwright E2E consolidé en P15.

## P0 livré (résumé)
- Tokens `@theme` (graphite + or + statuts + rayons) dans `apps/admin/app/globals.css`.
- 18 primitives UI testées dans `apps/admin/components/ui/` (barrel `@/components/ui`) : Status, Button, KpiCard, DataTable, Switch, Segmented, Pagination, Panel, Field, Input, Select, Textarea, Tag, Avatar, Toolbar, SaveBar, EmptyState, Drawer.
- Gate vert : 90 tests, `tsc --noEmit` OK, lint 0 erreur.

## Garde-fous (rappel)
- Travail sur `llm`, PR `llm → dev` (revue humaine). Jamais de push direct `dev`/`main`.
- Sécurité d'abord : Zod aux frontières, rôles DB (`app_admin`), nouveaux modèles REVOKE pour `app_web`, pas de secret en dur.
