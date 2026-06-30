# Patch notes — v0.6.x

## v0.6.0 — 2026-06-30 — Cadres d'analyse du profil (SWOT · 4P · Golden Circle · Ikigai)

Refonte du chapitre « Qui je suis » : les grilles d'analyse appliquées au **profil humain**
passent de `SWOT / PESTEL / PORTER` (liste plate) à **quatre cadres pertinents pour une personne**,
chacun avec son visuel dédié, éditables au back office et rendus (avec animations) sur le site.

### Données
- **Enum `AnalysisType`** : `SWOT · FOUR_P · GOLDEN_CIRCLE · IKIGAI` (PESTEL/PORTER quittent le
  profil — ils restent disponibles sur les fiches projet via `ProjectBlock` de type `ANALYSIS`).
- **Modèle `Analysis`** : `type` unique, `title`, `order`, `isVisible`, **`data` JSON**. Le modèle
  `AnalysisItem` (items plats) est supprimé.
- **Validation** : payload hétérogène validé par Zod par type (`parseAnalysis`, `@portfolio/core`),
  à l'écriture (BO) comme au rendu (web) — même pattern symétrique que les `ProjectBlock`.
  - SWOT : `{ strengths|weaknesses|opportunities|threats : { label, items[] } }`
  - 4P : `{ product|price|place|promotion : { label, role, points[] } }`
  - Golden Circle : `{ why, how, what }`
  - Ikigai : `{ love, good, world, paid, center }`
- **Migration** `20260630150000_profile_analyses_frameworks` : drop `AnalysisItem`, bascule de l'enum,
  ajout `isVisible` + `data` (contenu re-seedé).

### Back office (`apps/admin`)
- Éditeur `/analyses` repensé : un formulaire structuré par cadre (upsert, un par type), pré-rempli
  depuis la DB ; une puce par ligne dans les zones de texte.
- Actions : `upsertAnalysisAction` / `deleteAnalysisAction` (remplacent les anciennes actions
  d'items).

### Web (`apps/web`)
- Rendu fidèle des **quatre designs validés** : SWOT « tuiles teintées B », 4P « colonnes ouvertes »,
  Golden Circle « énoncés + radar animé », Ikigai « convergence ». Tokens DA identiques ; animations
  (radar, barres 4P, flèches Ikigai) branchées sur la révélation au scroll, coupées si
  `prefers-reduced-motion`.
- Lecture publique filtrée sur `isVisible`.

### Vérifications
- `prisma generate` · typecheck · lint (0 erreur) · **tests verts** (core + web + admin) · build
  web + admin.
- **Validation navigateur réel** (MCP Playwright) des 4 cadres en **desktop + mobile** sur données
  réelles ; un bug responsive Ikigai (cartes superposées sur mobile, `grid-area` hors media-query)
  détecté et corrigé à cette occasion.
