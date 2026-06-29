# Phase 15 — Finitions transverses — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 15 de la roadmap. Pré-requis : **P1→P14 mergées**.

**Goal :** durcir et polir l'ensemble — états vides/erreur/confirmation, a11y, responsive complet, E2E Playwright, perf, docs finales + patch note de version.

**Architecture :** passe transverse sur tous les écrans livrés ; pas de nouvelle feature, que de la robustesse.

---

### Task 1 : Audit des états (vides / erreur / suppression)
**Files:** divers écrans
- Vérifier que chaque liste a un **EmptyState**, chaque mutation un état **erreur** et une **confirmation de suppression**. Combler les manques (1 commit par écran corrigé). Commit(s) `fix(admin): empty/error/confirm states <écran>`.

### Task 2 : Accessibilité
- Audit a11y (focus visibles, rôles/aria, contraste AA sur la DA sombre, navigation clavier, ⌘K accessible). Corriger. Commit `fix(admin): a11y pass`.

### Task 3 : Responsive complet
- Rail → bottom bar < md ; tables → cartes/scroll ; éditeurs : aperçu masqué par défaut sur petit écran. Commit `fix(admin): responsive pass`.

### Task 4 : E2E Playwright (parcours critiques)
**Files:** Create `apps/admin/e2e/*.spec.ts`
- Parcours : **login MFA** → créer/éditer/supprimer un projet → modérer un témoignage → répondre dans l'inbox → créer un contact + déplacer un deal → Mission Control. Lancer `pnpm test:e2e` (ou `rtk playwright test`).
- Commit `test(admin): E2E critical journeys`.

### Task 5 : Perf
- Pagination **serveur** sur les grandes listes ; lazy-load aperçus/lourdeurs ; vérifier le build (`rtk next build`). Commit `perf(admin): server pagination & lazy`.

### Task 6 : Docs finales + version
**Files:** `docs/technical/{ARCHITECTURE,SECURITY,API_REFERENCE}.md`, `docs/patch_notes/patch_note_VX_Y.md`, `PROGRESS.md`, `TASKS.md`
- Décrire l'état **courant** (intemporel) : nouveaux écrans (inbox unifiée, CRM, Mission Control), flux RDV→agenda, posture sécu CRM. Patch note daté de la version. Commit `docs: BO v2 final docs + patch note vX.Y.0`.

### Task 7 : Barrière finale + PR
- **Checklist sécu** (`STACK_SECURITY`) verte ; `pnpm --filter admin test` + `test:e2e` + `tsc` + `lint` + `build` verts. PR « chore(admin): BO v2 finitions (P15) ».

## Definition of Done
- [ ] États vides/erreur/confirmation partout ; a11y AA ; responsive complet.
- [ ] E2E verts ; perf OK ; docs techniques + patch note à jour ; checklist sécu verte. PR.
