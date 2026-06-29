# Phase 3 — Projets (liste + éditeur + aperçu live) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 3 de la roadmap. Pré-requis : **P0 + P1 mergées**.

**Goal :** liste Projets conforme (DataTable CRUD) + éditeur `[id]` avec **aperçu live réduit & fermable** (le composant `live-preview` créé ici sera réutilisé en P4/P5). Conserver les blocs flexibles existants.

**Architecture :** réécriture présentationnelle des pages projets ; **nouveau** `components/live-preview/*` (panneau d'aperçu contrôlé par le state du formulaire). Logique métier (`project.ts`, `project-actions.ts`, blocs) **inchangée**. Réf. : `mockups/bo/v2/projets.html` + `projet-edit.html`.

**Tech Stack :** Next.js 16, React 19 (state form côté client pour l'aperçu), Vitest + RTL + userEvent.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/projets/page.tsx`, `app/(dashboard)/projets/[id]/page.tsx`, `lib/content/project.ts`, `lib/content/project-blocks.ts`, `lib/actions/project-actions.ts`, `components/block-editors/*`.
- Extraire : forme du `Project` (champs édités), signatures des Server Actions (create/update/delete/publish), structure de l'éditeur de blocs, validations Zod existantes.
- **Sortie :** carte des champs ↔ actions ↔ rendu public (pour brancher l'aperçu).

### Task 2 : Liste Projets (DataTable)
**Files:** Modify `app/(dashboard)/projets/page.tsx` (+ test du composant client de liste)
- Colonnes (titre/thumb, type, statut, en-avant, vues, modifié, actions) ; `Segmented` (filtres statut) ; recherche ; pagination ; actions de ligne **éditer / aperçu / supprimer**.
- **Suppression** = `Drawer`/dialog de **confirmation** avant l'action. TDD : la liste rend les lignes ; ouvrir la confirmation appelle l'action au « Confirmer ». Commit `feat(admin): projects list v2 with row actions`.

### Task 3 : Composant `live-preview`
**Files:** Create `components/live-preview/live-preview.tsx` (+ `.test.tsx`)
- API : `{ open, onToggle, children }` + sous-composant `PreviewFrame` (chrome navigateur). Panneau réduit, **fermable** (bouton ✕) et **ré-ouvrable** (bouton 👁).
- **TDD** : Step1 test FAIL — bascule `open` via le bouton, masque/affiche le panneau (`role="complementary"`), bouton ✕ ferme. Step2 FAIL. Step3 impl. Step4 PASS. Commit `feat(admin): add closable live-preview component`.

### Task 4 : Aperçu projet live
**Files:** Create `components/projects/project-preview.tsx` (+ test)
- Rend l'entête de fiche publique (catégorie, titre, sous-titre, résumé, tags) **à partir du state du formulaire** → mise à jour à la frappe.
- **TDD** : taper dans un champ met à jour le rendu (`userEvent.type` → texte reflété). Commit `feat(admin): live project preview`.

### Task 5 : Éditeur `[id]` branché
**Files:** Modify `app/(dashboard)/projets/[id]/page.tsx` (+ wrapper client)
- Formulaire (champs + blocs existants) à gauche, `live-preview` + `project-preview` à droite ; `SaveBar` ; conserver les Server Actions. Commit `feat(admin): project editor v2 with live preview`.

### Task 6 : Barrière qualité + PR
- `project.test.ts` (existant) + nouveaux tests verts ; typecheck/lint. Vérif manuelle CRUD + aperçu. Docs. PR `llm → dev` « feat(admin): projects v2 (P3) ».

## Definition of Done
- [ ] CRUD projets conforme (création/édition/suppression confirmée).
- [ ] `live-preview` réutilisable + aperçu projet en temps réel + fermable.
- [ ] Blocs existants préservés. Tests/typecheck/lint verts. Docs + PR.
