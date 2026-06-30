# Patch notes — v0.7.x

## v0.7.0 — 2026-06-30 — « Le cap » : trajectoire ascendante + édition des objectifs

La section « Le cap » (objectifs de carrière de la home) passe de la **liste à cases** à une
**trajectoire ascendante cosmique animée**, pilotée par la donnée `CareerGoal`. Le back office
gagne l'**édition inline** et le **réordonnancement** de ces objectifs.

### Web (`apps/web`)
- **Helper de géométrie pur & testé** `lib/cap-geometry.ts` : `goalToView` (statut → rôle visuel +
  libellé) et `computeLayout` (points, courbes lisses Catmull-Rom, dérivation du nœud « en cours »,
  stagger du reveal) pour les deux orientations — horizontale (desktop) et verticale (mobile).
  - Frontière « en cours » : 1er `IN_PROGRESS`, sinon dernier `ACHIEVED`, sinon aucune ligne pleine.
- **Composant client** `components/sections/cap-trajectory.tsx` : markup SSR (liste sémantique
  `<ul>/<li>` lisible sans JS + SVG décoratif `aria-hidden`), reveal **CSS** (clip-path +
  `transition-delay` par nœud) déclenché par un `IntersectionObserver` au bon seuil de visibilité
  (desktop à l'entrée, mobile quand le bloc épinglé est quasi plein écran). Garde `matchMedia` /
  `IntersectionObserver` + fallback `prefers-reduced-motion` (tout visible, zéro animation).
- **CSS module** `cap-trajectory.module.css` (porté du mockup validé `mockups/cap-trajectory.html`) :
  starfield, soleil « en cours », étoile-cap, balises cibles. Mobile en **sticky-pin** (le bloc se
  fige le temps de l'animation puis le scroll reprend ; `width:100%` du graphe mobile conservé pour
  éviter l'écrasement du flex item à 0). `prefers-reduced-motion` **scopé au module**.
- `Cap` (server) délègue désormais le rendu à `CapTrajectory`, en gardant l'en-tête + le compteur
  `NN / NN atteints`. Styles obsolètes de l'ancienne liste à cases retirés de `globals.css`.

### Back office (`apps/admin`)
- **Édition inline** d'un objectif (`role` + `status`) et **réordonnancement** ↑/↓ sur `/parcours`.
- Lib : `updateGoal` (validé `CareerGoalUpdate`) et `moveGoal` (échange d'`order` avec le voisin,
  en transaction). Actions : `updateGoalAction` / `moveGoalAction` (`requireEnrolledSession` →
  Zod → mutation → `revalidatePath('/parcours')`).

### Core (`@portfolio/core`)
- Schéma `CareerGoalUpdate` (= `CareerGoalInput` + `id`) exporté.

### Notes
- Pas de migration DB (le modèle `CareerGoal` existe déjà). Le seed des 8 objectifs réels
  (un seul `IN_PROGRESS`) est inchangé.
- Validation navigateur réelle (MCP Playwright) : desktop + mobile (sticky-pin) +
  `prefers-reduced-motion` ; reflet BO → web confirmé (édition statut + réordonnancement).
