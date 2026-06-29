# P3 — Web: Pages projet (étude de cas par blocs) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Page projet `/projets/[slug]` rendue depuis la DB : entête + **blocs modulaires** (un composant par `ProjectBlockType`) + projet suivant, accessible en cliquant une carte projet de la home.

**Architecture:** Server Component `app/projets/[slug]/page.tsx`. Loader dédié (rôle `app_web`, `PUBLISHED` only). Le corps = un **renderer de blocs** : chaque bloc a un `type` + un `data` JSON **validé par un schéma Zod partagé** (`@portfolio/core/project-blocks`) puis rendu par un composant dédié. Galerie = `ProjectImage`. **Code propre : 1 composant + 1 CSS Module par bloc**, props typées, pas de `any`.

**Tech Stack:** Next.js 16 RSC, Prisma 7, Zod, CSS Modules, Vitest+RTL, Playwright.

**Réf. markup/DA :** `mockups/project.html` + `project-logiciel/site/business.html`.

---

### Code standards (rappel, vaut pour tous les plans web/admin)
- **CSS séparé** : un `*.module.css` par composant (pas de style inline, pas de `<style>` géant). Tokens DA centralisés (globals/@theme).
- Composants **purs** côté présentation, **données** chargées en amont (loaders).
- **Zod** à toute frontière (params, `data` JSON, formulaires). Pas de magic numbers, early returns, nesting ≤ 3, pas de dead code.
- A11y : landmarks, `alt`, focus visibles, `prefers-reduced-motion`.
- Voir `.claude/playbooks/framework-nextjs.md`, `framework-react.md`, `css-tailwind.md`, `paradigme-solid.md`.

---

### Task 1: Schémas Zod des blocs

**Files:** Create `packages/core/src/project-blocks/schemas.ts`, Test `…/schemas.test.ts`

**Step 1: Failing test**
```ts
import { expect, test } from "vitest";
import { ProcessBlock, GameDesignBlock } from "./schemas";
test("ProcessBlock valide des phases", () => {
  const r = ProcessBlock.safeParse({ phases: [{ label: "Cadrage", start: 0, width: 14 }] });
  expect(r.success).toBe(true);
});
test("ProcessBlock rejette une largeur hors bornes", () => {
  expect(ProcessBlock.safeParse({ phases: [{ label: "x", start: 0, width: 999 }] }).success).toBe(false);
});
```

**Step 2:** Run → FAIL.

**Step 3: Implement** un schéma par type (CONTEXT, PROCESS, ANALYSIS, GAME_DESIGN, ARCHITECTURE, SECURITY, DESIGN_UX, METRICS, RECOMMENDATIONS, RESULTS, GALLERY, TEXT) + un **discriminé** `ProjectBlockData`. Bornes (`width 0..100`), longueurs max, etc.

**Step 4:** Run → PASS. **Commit** `feat(core): zod schemas for project blocks`.

---

### Task 2: Loader projet

**Files:** Create `apps/web/lib/data/project.ts`, Test `…/project.test.ts`

**Step 1: Failing test** — `getProjectBySlug` renvoie `null` si non publié, l'objet (avec blocs ordonnés) sinon (DB de test + factory).

**Step 2-4:** Implémenter : `findUnique({ where:{ slug }})` filtré `status:"PUBLISHED"`, `include` blocs (orderBy order), images, links, technologies, faqs (scope PROJECT). `select` sûrs. Commit `feat(web): project loader`.

---

### Task 3: Renderer de blocs

**Files:** Create `apps/web/components/blocks/` (un fichier + `.module.css` par bloc) + `apps/web/components/blocks/block-renderer.tsx`, Tests par bloc.

**Step 1:** Pour CHAQUE bloc : test RTL minimal (ex. `ProcessBlock` rend une barre par phase), puis composant qui **parse `data` via le schéma Zod** et rend le markup (porté des maquettes), puis test vert, commit.

**Step 2:** `BlockRenderer` : `switch(block.type)` → composant, `isVisible` filtré, ordre respecté. Bloc inconnu/`data` invalide → ne rien rendre (fail-safe) + `console.warn` (jamais throw en prod).

**Commit** `feat(web): modular project block renderer`.

---

### Task 4: Page projet + entête + projet suivant

**Files:** Create `apps/web/app/projets/[slug]/page.tsx`, `components/sections/project-hero.tsx`

**Step 1:** `generateStaticParams` (slugs publiés) optionnel ; `page` charge le
projet (404 via `notFound()` si absent), rend hero (titre, méta, sig, cover) +
`BlockRenderer` + lien « projet suivant » (par `order`).

**Step 2:** Build OK. **Commit** `feat(web): project case-study page`.

---

### Task 5: E2E — clic carte projet → page projet

**Files:** Create `e2e/project.spec.ts`
```ts
import { expect, test } from "@playwright/test";
test("cliquer un projet de la home ouvre sa page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Domestic Revolt/i }).first().click();
  await expect(page).toHaveURL(/\/projets\/domestic-revolt/);
  await expect(page.getByRole("heading", { name: /Domestic Revolt/i })).toBeVisible();
});
```
Run → vert une fois P2+P3 en place. **Commit** `test(e2e): navigate to project page`.

---

## Definition of Done (P3)
- `/projets/[slug]` rendue depuis la DB, blocs modulaires typés (Zod) + propres
  (1 composant + 1 CSS Module par bloc).
- Clic d'une carte projet (home) → page projet (E2E vert).
- 404 propre si projet absent/non publié.
