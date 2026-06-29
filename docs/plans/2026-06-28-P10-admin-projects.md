# P10 — Admin: Projets & éditeur de blocs — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware + assist IA (P14).

**Goal:** CRUD complet des projets et **éditeur de blocs modulaires** (ajout/retrait/réordonnancement/visibilité, contenu `data` par type validé Zod), galerie d'images, liens, techno, SEO.

**Architecture:** Server Actions (`app_admin`) + Zod (réutilise `@portfolio/core/project-blocks` de P3). Éditeur de blocs = liste réordonnable de formulaires **spécifiques par `ProjectBlockType`** (un module d'édition par type, symétrique du renderer public). Galerie via upload (P11). Modulaire.

**Tech Stack:** Next.js 16 Server Actions, Prisma 7, Zod, Vitest, Playwright.

---

### Task 1: CRUD Project (entête)

**Files:** `apps/admin/lib/actions/projects.ts` (+ test), écran `app/(dashboard)/projets/*`.
Champs : titre/slug, **type**, rôle, période, statusLabel, tagline, sigText,
status (DRAFT/PUBLISHED), featured, order, SEO (seoTitle/desc/aiSummary/OG),
cover, technologies (multi-select), links (liste). Test : create/update + slug
unique. **Commit** `feat(admin): project CRUD`.

---

### Task 2: Actions blocs

**Files:** `apps/admin/lib/actions/project-blocks.ts` (+ test).
`addBlock(projectId, type)`, `updateBlock(id, data)` (parse via schéma du type),
`reorderBlocks`, `toggleVisible`, `deleteBlock`. **Test** : `updateBlock` rejette
un `data` invalide selon le type ; reorder persiste. **Commit** `feat(admin): project block actions`.

---

### Task 3: Modules d'édition par type de bloc

**Files:** `apps/admin/components/block-editors/*` (un module + CSS Module par type :
context, process/gantt, analysis, game-design, architecture, security, design-ux,
metrics, recommendations, results, gallery, text).
Chaque éditeur : champs typés → produit un `data` conforme au schéma Zod. Tests RTL
(ex. l'éditeur process ajoute/retire une phase). **Commit** `feat(admin): per-type block editors`.

---

### Task 4: Éditeur de blocs (liste réordonnable)

**Files:** `apps/admin/components/block-list-editor/*`.
Ajout (menu des types), drag-reorder, toggle visibilité, suppression. Compose les
éditeurs par type. **Commit** `feat(admin): project block list editor`.

---

### Task 5: E2E

`e2e/admin-projects.spec.ts` : créer un projet, ajouter un bloc « Résultats »,
publier → la page projet publique affiche le bloc. **Commit** `test(e2e): project block editing reflects on site`.

---

## Definition of Done (P10)
- CRUD projet + éditeur de blocs complet (ajout/retrait/réordo/visibilité, `data`
  validé Zod par type), galerie, liens, techno, SEO.
- Symétrie éditeur (admin) / renderer (web). Tests unit + E2E.
