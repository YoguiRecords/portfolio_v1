# Phase 2 — Dashboard v2 — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 2 de la roadmap. Pré-requis : **P0 + P1 mergées**.

**Goal :** un Dashboard **accueillant et dense** centré portfolio & audience (distinct de Mission Control), conforme à `mockups/bo/v2/dashboard.html`.

**Architecture :** réécriture de `app/(dashboard)/page.tsx` consommant un service d'agrégation enrichi ; cartes via primitives P0 (`KpiCard`, `Panel`, `DataTable`). Pas d'inbox/pipeline ici (→ Mission Control P12).

**Tech Stack :** Next.js 16 (Server Component), Vitest.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `lib/data/dashboard.ts` (agrégations actuelles), `app/(dashboard)/page.tsx`, `components/dashboard-stats/dashboard-stats.tsx`.
- Repérer l'accès **Umami** pour le trafic (variable d'env / API ; sinon prévoir un fallback « non configuré »). Vérifier les comptes dispo : projets/articles/témoignages (`lib/content/*`).
- **Sortie :** signatures actuelles + ce qui manque (trafic, top contenus, « à traiter »).

### Task 2 : Service d'agrégation dashboard
**Files:** Modify `lib/data/dashboard.ts` (+ `dashboard.test.ts`)
- Exposer : KPIs (visiteurs 30 j + delta, projets, articles, témoignages à valider), `contentToTreat` (brouillons + en revue + témoignage PENDING), `topContent` (par vues).
- **TDD** : test FAIL sur la forme attendue → impl (requêtes Prisma + Umami avec fallback) → PASS. Commit `feat(admin): dashboard aggregation service`.

### Task 3 : Carte « trafic » (mini-graphe)
**Files:** Create `components/dashboard/traffic-panel.tsx` (+ test léger)
- Barres + résumé (page top, source #1). Données du service. Commit `feat(admin): dashboard traffic panel`.

### Task 4 : Section « contenu à traiter » + « top contenus »
**Files:** Create `components/dashboard/*` (+ tests rendu)
- Liste à-traiter (liens vers les bonnes sections) ; table top contenus (`DataTable`). Commit `feat(admin): dashboard content panels`.

### Task 5 : Page Dashboard
**Files:** Modify `app/(dashboard)/page.tsx`
- Greeting + grille KPIs + panels. Server Component branché sur le service. Commit `feat(admin): assemble dashboard v2 page`.

### Task 6 : Barrière qualité + PR
- Tests/typecheck/lint verts. Vérif visuelle. Docs (`PROGRESS`/`TASKS`). PR `llm → dev` « feat(admin): dashboard v2 (P2) ».

## Definition of Done
- [ ] KPIs + trafic + à-traiter + top contenus réels. Fallback trafic si Umami absent.
- [ ] Aucun doublon avec Mission Control (pas d'inbox/pipeline ici). Tests verts. Docs + PR.
