# Phase 4 — Articles (liste + éditeur + programmation) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 4 de la roadmap. Pré-requis : **P3 mergée** (réutilise `live-preview`).

**Goal :** liste Articles conforme + éditeur (markdown + aperçu live) + **publication programmée** (`SCHEDULED`/`scheduledAt`, cron existant).

**Architecture :** réécriture présentationnelle ; logique `article.ts` / `article-actions.ts` / `publishing/*` **inchangée** ; réutilise `components/live-preview`.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/articles/page.tsx`, `lib/content/article.ts`, `lib/actions/article-actions.ts`, `lib/publishing/publish-due.ts`, `app/api/cron/publish/route.ts`.
- Extraire : champs `Article` (excerpt, content markdown, tags, status, scheduledAt, SEO), actions, mécanique de programmation.
- **Sortie :** mapping champs ↔ actions ↔ cron.

### Task 2 : Liste Articles
**Files:** Modify `app/(dashboard)/articles/page.tsx` (+ test)
- `DataTable` (titre, catégorie/tags, statut, vues, modifié, actions) + `Segmented` (Tous/Publiés/En revue/Brouillons) + recherche + suppression confirmée. Commit `feat(admin): articles list v2`.

### Task 3 : Aperçu article live
**Files:** Create `components/articles/article-preview.tsx` (+ test)
- Rendu markdown sûr (renderer existant, pas d'HTML brut non assaini — cf. `STACK_SECURITY`) consommant le state. TDD : la frappe met à jour le rendu. Commit `feat(admin): live article preview`.

### Task 4 : Éditeur article + programmation
**Files:** Modify `app/(dashboard)/articles/[id]` (ou page d'édition existante) (+ test)
- Markdown + `live-preview` ; champ **date de programmation** (status `SCHEDULED` + `scheduledAt`) ; tags ; SEO.
- **TDD** : choisir une date future passe le statut à `SCHEDULED` (action mockée). Commit `feat(admin): article editor v2 with scheduling`.

### Task 5 : Barrière qualité + PR
- `publish-due.test.ts` (existant) + nouveaux verts ; typecheck/lint. Vérif manuelle. Docs. PR « feat(admin): articles v2 (P4) ».

## Definition of Done
- [ ] CRUD articles + aperçu live + **programmation** conformes. Markdown rendu sûr. Tests verts. Docs + PR.
