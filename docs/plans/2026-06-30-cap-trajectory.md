# « Le cap » — Trajectoire ascendante cosmique : Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remplacer la liste à cases de la section « Le cap » (objectifs de carrière) par une trajectoire ascendante cosmique animée — horizontale sur desktop, verticale épinglée (sticky-pin, reveal bas→haut auto) sur mobile — pilotée par la donnée `CareerGoal`, et compléter le back office pour éditer/réordonner ces objectifs.

**Architecture :** Section `Cap` (server component) inchangée dans son rôle (eyebrow/titre/intro + compteur), déléguant le rendu à un nouveau composant **client** `CapTrajectory` (markup SSR + SVG décoratif + `<ul>` sémantique). La géométrie (points, courbes, dérivation du nœud « en cours ») vit dans un helper **pur et testé** `cap-geometry.ts`. L'animation est **CSS** (clip-path + `transition-delay`/`animation-delay` par nœud) ; le JS du composant se limite à ajouter `.play` au bon seuil de visibilité (média-aware) avec fallback `prefers-reduced-motion`. Aucune migration DB (le modèle `CareerGoal` existe déjà). Le BO `/parcours` gagne l'édition (role/statut) et le réordonnancement.

**Tech Stack :** Next.js 16 (App Router, RSC), TypeScript strict, CSS Modules + tokens globaux (`globals.css`), Vitest + React Testing Library, Prisma (`CareerGoal`), Zod (`@portfolio/core`), Server Actions BO. Polices déjà présentes : `--font-inter` (Inter) + `--font-mono` (JetBrains Mono) — **aucune police à ajouter**.

**Référence visuelle :** `mockups/cap-trajectory.html` (mockup validé, versionné).

---

## Conventions du projet à respecter (rappel)
- Branche de travail **`llm`** uniquement, commits atomiques (Conventional Commits, scope `web` ou `admin`/`core`), PR `llm → dev`. Jamais `main`/`dev` en direct.
- Couleurs **via tokens** (`--accent`, `--accent-strong`, `--border-dark`, `--on-dark*`, `--dark-*`, `--font-mono`) — **zéro couleur en dur** dans les composants/CSS.
- SOLID/DRY/KISS/YAGNI, early returns, pas de nesting > 3, naming explicite, JSDoc sur exports.
- Tests AAA, comportement > implémentation. `pnpm --filter web test`, `pnpm --filter @portfolio/core test`, `pnpm --filter admin test`.
- **Validation navigateur réelle NON-NÉGOCIABLE** (MCP Playwright) desktop + mobile avant de dire « terminé ».
- Doc : à la livraison, MAJ `PROGRESS.md`, `TASKS.md`, `docs/patch_notes/…`, `API_REFERENCE.md`.

---

## Phase 0 — Préparation

### Task 0.1 : Vérifier la branche et l'app dev
**Step 1:** S'assurer d'être sur `llm` à jour.
Run: `rtk git status && rtk git branch --show-current`
Expected: branche `llm`.

**Step 2:** Lancer l'app web en dev pour les vérifs visuelles ultérieures.
Run: `pnpm --filter web dev`
Expected: web sur `http://localhost:3100`. (Laisser tourner dans un terminal dédié.)

**Step 3:** Vérifier l'état vert de départ.
Run: `pnpm --filter web test && rtk tsc -p apps/web`
Expected: tests verts, pas d'erreur TS.

---

## Phase 1 — Helper de géométrie (pur, testé en TDD)

### Task 1.1 : Types + mapping statut → vue
**Files:**
- Create: `apps/web/lib/cap-geometry.ts`
- Test: `apps/web/lib/cap-geometry.test.ts`

**Step 1: Write the failing test**
```ts
// apps/web/lib/cap-geometry.test.ts
import { describe, expect, test } from "vitest";
import { goalToView, computeLayout, type GoalLike } from "./cap-geometry";

describe("goalToView", () => {
  test("mappe chaque statut vers son libellé et son kind", () => {
    expect(goalToView("ACHIEVED")).toEqual({ kind: "done", label: "Acquis" });
    expect(goalToView("IN_PROGRESS")).toEqual({ kind: "now", label: "En cours" });
    expect(goalToView("TARGET")).toEqual({ kind: "next", label: "Cible" });
    expect(goalToView("HORIZON")).toEqual({ kind: "far", label: "Horizon" });
  });
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm --filter web test cap-geometry`
Expected: FAIL — `goalToView`/`computeLayout` introuvables.

**Step 3: Write minimal implementation**
```ts
// apps/web/lib/cap-geometry.ts
/** Statut d'un objectif de carrière (miroir de l'enum Prisma GoalStatus). */
export type GoalStatus = "ACHIEVED" | "IN_PROGRESS" | "TARGET" | "HORIZON";

/** Forme minimale d'un objectif consommée par la trajectoire. */
export interface GoalLike {
  id: string;
  role: string;
  status: GoalStatus;
}

/** Rôle visuel d'un nœud sur la trajectoire. */
export type NodeKind = "done" | "now" | "next" | "far";
export interface GoalView {
  kind: NodeKind;
  /** Libellé court affiché en pastille mono (Acquis / En cours / …). */
  label: string;
}

const STATUS_VIEW: Record<GoalStatus, GoalView> = {
  ACHIEVED: { kind: "done", label: "Acquis" },
  IN_PROGRESS: { kind: "now", label: "En cours" },
  TARGET: { kind: "next", label: "Cible" },
  HORIZON: { kind: "far", label: "Horizon" },
};

/** Maps a goal status to its visual role + short label. */
export function goalToView(status: GoalStatus): GoalView {
  return STATUS_VIEW[status] ?? STATUS_VIEW.HORIZON;
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm --filter web test cap-geometry`
Expected: PASS (goalToView). `computeLayout` test encore en échec (next task) — OK si on isole : lancer seulement le `describe("goalToView")`.

**Step 5: Commit**
```bash
rtk git add apps/web/lib/cap-geometry.ts apps/web/lib/cap-geometry.test.ts
rtk git commit -m "feat(web): add cap goal status→view mapping"
```

---

### Task 1.2 : `computeLayout` — points, courbes, frontière « en cours »
**Files:**
- Modify: `apps/web/lib/cap-geometry.ts`
- Test: `apps/web/lib/cap-geometry.test.ts`

**Concept clé (dérivation depuis la donnée) :**
- `nowIndex` = index du **premier** `IN_PROGRESS` ; sinon index du **dernier** `ACHIEVED` ; sinon `-1`.
- Ligne **pleine** = nœuds `0..nowIndex` (parcouru). Ligne **pointillée** = nœuds `nowIndex..fin` (futur). Si `nowIndex === -1`, tout est pointillé.
- `dest` = dernier nœud (l'étoile-cap).
- `delay(i)` = stagger du reveal : `i <= nowIndex ? 0.1 + i*0.5 : 0.1 + (nowIndex+1)*0.5 + (i - nowIndex)*0.45` (croissant, continu).

**Step 1: Write the failing test**
```ts
// (ajouter à apps/web/lib/cap-geometry.test.ts)
describe("computeLayout", () => {
  const goals: GoalLike[] = [
    { id: "a", role: "Développeur", status: "ACHIEVED" },
    { id: "b", role: "Ingénieur", status: "ACHIEVED" },
    { id: "c", role: "Indépendant", status: "IN_PROGRESS" },
    { id: "d", role: "CTO", status: "TARGET" },
  ];

  test("place un point par objectif et dérive le nœud en cours", () => {
    const l = computeLayout(goals, "horizontal");
    expect(l.nodes).toHaveLength(4);
    expect(l.nowIndex).toBe(2); // le IN_PROGRESS
    expect(l.nodes[3].isDest).toBe(true); // dernier = étoile-cap
    expect(l.nodes[0].view.kind).toBe("done");
    expect(l.nodes[2].view.kind).toBe("now");
  });

  test("sans IN_PROGRESS, la frontière est le dernier ACHIEVED", () => {
    const l = computeLayout(
      [
        { id: "a", role: "Dev", status: "ACHIEVED" },
        { id: "b", role: "CTO", status: "TARGET" },
      ],
      "vertical",
    );
    expect(l.nowIndex).toBe(0);
  });

  test("délais strictement croissants (stagger du reveal)", () => {
    const d = computeLayout(goals, "horizontal").nodes.map((n) => n.delay);
    for (let i = 1; i < d.length; i++) expect(d[i]).toBeGreaterThan(d[i - 1]);
  });

  test("gère 0 et 1 objectif sans planter", () => {
    expect(computeLayout([], "horizontal").nodes).toHaveLength(0);
    expect(computeLayout([goals[0]], "vertical").solidPath).toBeTypeOf("string");
  });
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm --filter web test cap-geometry`
Expected: FAIL — `computeLayout` non défini.

**Step 3: Write minimal implementation** (ajouter à `cap-geometry.ts`)
```ts
export interface Point { x: number; y: number }

export interface LayoutNode {
  goal: GoalLike;
  view: GoalView;
  /** Position en % du conteneur (left/top), prête pour le style inline. */
  leftPct: number;
  topPct: number;
  /** Délai de reveal en secondes (transition-delay/animation-delay). */
  delay: number;
  isDest: boolean;
}

export interface Layout {
  nodes: LayoutNode[];
  nowIndex: number;
  /** Chemins en coordonnées du viewBox. */
  solidPath: string;
  dashedPath: string;
  /** Aire sous la courbe pleine (desktop uniquement ; "" en vertical). */
  areaPath: string;
  viewBox: { w: number; h: number };
}

export type Orientation = "horizontal" | "vertical";

/** Catmull-Rom → cubic bézier : courbe lisse passant par tous les points. */
function smoothPath(p: Point[]): string {
  if (p.length < 2) return p.length === 1 ? `M${p[0].x},${p[0].y}` : "";
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p[i + 1];
    d += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${
      p2.x - (p3.x - p1.x) / 6
    },${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`;
  }
  return d;
}

/** Index frontière : 1er IN_PROGRESS, sinon dernier ACHIEVED, sinon -1. */
function frontierIndex(goals: GoalLike[]): number {
  const inProgress = goals.findIndex((g) => g.status === "IN_PROGRESS");
  if (inProgress >= 0) return inProgress;
  let lastDone = -1;
  goals.forEach((g, i) => {
    if (g.status === "ACHIEVED") lastDone = i;
  });
  return lastDone;
}

/**
 * Computes the trajectory geometry for `goals` in the given orientation.
 * Horizontal (desktop): viewBox 1000×480, ascending left→right.
 * Vertical (mobile): viewBox 100×680, ascending bottom→top.
 */
export function computeLayout(goals: GoalLike[], orientation: Orientation): Layout {
  const n = goals.length;
  const horizontal = orientation === "horizontal";
  const w = horizontal ? 1000 : 100;
  const h = horizontal ? 480 : 680;
  const padL = horizontal ? 66 : 15;
  const padR = horizontal ? 66 : 0;
  const padT = horizontal ? 66 : 54;
  const padB = horizontal ? 96 : 50;
  const nowIndex = frontierIndex(goals);

  const points: Point[] = goals.map((_, i) => {
    const t = n <= 1 ? 0 : i / (n - 1);
    if (horizontal) {
      return { x: padL + t * (w - padL - padR), y: h - padB - t * (h - padB - padT) };
    }
    // vertical : Développeur en bas (y grand) → CEO en haut (y petit)
    return { x: padL + i * 1.45, y: h - padB - t * (h - padB - padT) };
  });

  const baseY = h - padB + 26;
  const solidPts = nowIndex >= 0 ? points.slice(0, nowIndex + 1) : [];
  const dashedPts = nowIndex >= 0 ? points.slice(nowIndex) : points;
  const solidPath = smoothPath(solidPts);
  const dashedPath = smoothPath(dashedPts);
  const areaPath =
    horizontal && solidPts.length >= 2
      ? `${solidPath} L${solidPts[solidPts.length - 1].x},${baseY} L${solidPts[0].x},${baseY} Z`
      : "";

  const nodes: LayoutNode[] = goals.map((goal, i) => {
    const p = points[i];
    const base = nowIndex >= 0 ? nowIndex : -1;
    const delay =
      i <= base ? 0.1 + i * 0.5 : 0.1 + (base + 1) * 0.5 + (i - base) * 0.45;
    return {
      goal,
      view: goalToView(goal.status),
      leftPct: (p.x / w) * 100,
      topPct: (p.y / h) * 100,
      delay: Number(delay.toFixed(2)),
      isDest: i === n - 1,
    };
  });

  return { nodes, nowIndex, solidPath, dashedPath, areaPath, viewBox: { w, h } };
}
```

**Step 4: Run test to verify it passes**
Run: `pnpm --filter web test cap-geometry`
Expected: PASS (toutes les assertions).

**Step 5: Commit**
```bash
rtk git add apps/web/lib/cap-geometry.ts apps/web/lib/cap-geometry.test.ts
rtk git commit -m "feat(web): add cap trajectory geometry helper"
```

---

## Phase 2 — CSS Module scopé

### Task 2.1 : Porter les styles du mockup dans un module scopé
**Files:**
- Create: `apps/web/components/sections/cap-trajectory.module.css`

> Source = `mockups/cap-trajectory.html` (bloc `<style>`). On retire les tokens redéclarés (déjà globaux dans `globals.css`) et on **scope** via classes du module. **Garder le `width:100%` du `.pin .mchart`** (bug corrigé : sans largeur, le flex item s'écrase à 0 → ligne invisible).

**Step 1: Créer le module** (extrait porté ; reprendre l'intégralité des règles du mockup, classes en camelCase du module) :
```css
/* apps/web/components/sections/cap-trajectory.module.css */
/* Tokens : hérités de globals.css (--accent, --font-mono, --border-dark, …). */

.chart, .mchart { position: relative; border-radius: 14px; }
.chart { height: 480px; margin-top: 54px; }
.mchart { height: 680px; display: none; }
.chart svg, .mchart svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 1; }

.stars { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.stars span { position: absolute; border-radius: 50%; background: #fff; animation: tw 4s ease-in-out infinite; }
@keyframes tw { 0%,100% { opacity: var(--o,.4); } 50% { opacity: calc(var(--o,.4)*.3); } }

.node { position: absolute; transform: translate(-50%,-50%); z-index: 3; }
.dot { width: 14px; height: 14px; border-radius: 50%; background: #0a0a0a; border: 2px solid #3a3e42;
  position: relative; display: flex; align-items: center; justify-content: center; transition: .2s; }
.done .dot { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 14px rgba(240,168,0,.6); }
.check { width: 9px; height: 9px; display: none; }
.done .check { display: block; }
.check path { stroke: #1c1c1c; stroke-width: 3.2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
.now .dot { width: 30px; height: 30px; border: none;
  background: radial-gradient(circle at 38% 32%, #fff3d6, var(--accent) 48%, var(--accent-strong) 82%);
  box-shadow: 0 0 50px rgba(240,168,0,.55), 0 0 120px rgba(240,168,0,.28); animation: sun 2.6s ease-in-out infinite; }
@keyframes sun { 0%,100% { box-shadow: 0 0 50px rgba(240,168,0,.55), 0 0 120px rgba(240,168,0,.28); }
  50% { box-shadow: 0 0 64px rgba(240,168,0,.7), 0 0 150px rgba(240,168,0,.34); } }
.ping { position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; border-radius: 50%;
  border: 1.5px solid rgba(240,168,0,.5); transform: translate(-50%,-50%); animation: ping 3.2s ease-out infinite; }
.ping.p2 { animation-delay: 1.6s; }
@keyframes ping { 0% { width: 30px; height: 30px; opacity: .7; } 100% { width: 120px; height: 120px; opacity: 0; } }
.next .dot, .far .dot { background: #d8dadf; border: none; width: 10px; height: 10px; box-shadow: 0 0 8px rgba(216,218,223,.25); }
.beacon { display: none; position: absolute; top: 50%; left: 50%; width: 10px; height: 10px; border-radius: 50%;
  border: 1.5px solid rgba(240,168,0,.55); transform: translate(-50%,-50%); }
.dest .dot { width: 16px; height: 16px; background: radial-gradient(circle,#fff,var(--accent) 70%);
  box-shadow: 0 0 22px rgba(240,168,0,.8); border: none; }
.ring { position: absolute; top: 50%; left: 50%; width: 16px; height: 16px; border-radius: 50%;
  border: 1px solid rgba(240,168,0,.45); transform: translate(-50%,-50%); animation: ping 3.6s ease-out infinite; }
.ring.r2 { animation-delay: 1.8s; }
.spark { position: absolute; top: 50%; left: 50%; width: 46px; height: 46px; transform: translate(-50%,-50%);
  background: linear-gradient(transparent 47%, rgba(240,168,0,.45) 50%, transparent 53%),
              linear-gradient(90deg, transparent 47%, rgba(240,168,0,.45) 50%, transparent 53%);
  animation: spark 6s linear infinite; }
@keyframes spark { to { transform: translate(-50%,-50%) rotate(360deg); } }

.label { position: absolute; top: 20px; left: 50%; transform: translateX(-50%); text-align: center; white-space: nowrap; }
.now .label { top: 30px; } .dest .label { top: 22px; }
.name { display: inline-block; font-size: 13px; font-weight: 600; color: #e8eaec;
  background: rgba(8,8,8,.72); border: 1px solid var(--border-dark); padding: 5px 11px; border-radius: 20px; }
.now .name { color: #fff; font-weight: 700; border-color: rgba(240,168,0,.4); }
.next .name, .far .name { color: #999b9e; }
.tag { font: 600 9px/1 var(--font-mono), monospace; letter-spacing: .16em; text-transform: uppercase; color: #7a7d80; margin-top: 7px; }
.now .tag { color: var(--accent); }
.here { position: absolute; left: 50%; transform: translateX(-50%); bottom: 34px;
  font: 700 8.5px/1 var(--font-mono), monospace; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); white-space: nowrap; }

/* labels mobile : à droite du point */
.mchart .label { top: 50%; left: 24px; transform: translateY(-50%); text-align: left; }
.mchart .now .label, .mchart .dest .label { left: 26px; top: 50%; }
.mchart .here { display: none; }

.axis { display: flex; justify-content: space-between; margin-top: 16px;
  font: 600 10px/1 var(--font-mono), monospace; letter-spacing: .18em; text-transform: uppercase; color: #5a5e62; }

/* ===== Reveal (déclenché par .play sur le conteneur) ===== */
@keyframes beaconPulse { 0% { opacity: .7; width: 10px; height: 10px; } 100% { opacity: 0; width: 54px; height: 54px; } }
.chart svg { clip-path: inset(0 100% 0 0); }
.chart.play svg { clip-path: inset(0 0 0 0); transition: clip-path 2.2s linear; }
.mchart svg { clip-path: inset(100% 0 0 0); }            /* mobile : trace bas→haut */
.mchart.play svg { clip-path: inset(0 0 0 0); transition: clip-path 2.2s linear; }
.node { opacity: 0; }
.play .node { opacity: 1; transition: opacity .45s ease, transform .5s cubic-bezier(.2,.7,.3,1.3); transition-delay: var(--d); }
.node { transform: translate(-50%,-50%) scale(.5); }
.play .node { transform: translate(-50%,-50%) scale(1); }
.done .check path { stroke-dasharray: 16; stroke-dashoffset: 16; }
.play .done .check path { transition: stroke-dashoffset .42s ease; transition-delay: calc(var(--d) + .12s); stroke-dashoffset: 0; }
.play .next .beacon, .play .far .beacon { display: block; animation: beaconPulse 2.4s ease-out infinite; animation-delay: var(--d); }
.here { opacity: 0; }
.play .now .here { opacity: 1; transition: opacity .5s ease; transition-delay: 2.4s; }

/* ===== Responsive desktop ↔ mobile (sticky-pin) ===== */
.track { display: none; }
@media (max-width: 680px) {
  .chart, .axis { display: none; }
  .mchart { display: block; }
  .track { display: block; position: relative; height: 170vh; }   /* durée du pin ; après → scroll normal */
  .pin { position: sticky; top: 0; height: 100vh; display: flex; align-items: center; }
  .pin .mchart { margin-top: 0; width: 100%; height: 74vh; }       /* width:100% sinon flex item → 0 → ligne invisible */
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
  .chart svg, .mchart svg { clip-path: none !important; }
  .node, .here { opacity: 1 !important; transform: translate(-50%,-50%) !important; transition: none !important; }
  .done .check path { stroke-dashoffset: 0 !important; transition: none !important; }
}
```

**Step 2: Commit**
```bash
rtk git add apps/web/components/sections/cap-trajectory.module.css
rtk git commit -m "feat(web): add cap trajectory css module (ported from mockup)"
```

---

## Phase 3 — Composant client `CapTrajectory` + branchement

### Task 3.1 : Composant client (markup SSR + reveal au bon seuil)
**Files:**
- Create: `apps/web/components/sections/cap-trajectory.tsx`
- Test: `apps/web/components/sections/cap-trajectory.test.tsx`

**Step 1: Write the failing test**
```tsx
// apps/web/components/sections/cap-trajectory.test.tsx
import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { CapTrajectory } from "./cap-trajectory";
import type { GoalLike } from "../../lib/cap-geometry";

const goals: GoalLike[] = [
  { id: "a", role: "Développeur", status: "ACHIEVED" },
  { id: "b", role: "Indépendant · fondateur", status: "IN_PROGRESS" },
  { id: "c", role: "CTO", status: "TARGET" },
];

test("rend un item de liste par objectif, accessible, et marque l'en cours", () => {
  render(<CapTrajectory goals={goals} />);
  const list = screen.getAllByRole("list")[0]; // <ul> sémantique (desktop)
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  // labels présents
  expect(screen.getAllByText("Développeur").length).toBeGreaterThan(0);
  expect(screen.getAllByText("En cours").length).toBeGreaterThan(0);
});

test("est visible sans JS (pas d'état caché en SSR via aria)", () => {
  render(<CapTrajectory goals={goals} />);
  // le SVG décoratif est aria-hidden ; la liste textuelle reste lisible
  expect(screen.getAllByText("CTO").length).toBeGreaterThan(0);
});
```

**Step 2: Run test to verify it fails**
Run: `pnpm --filter web test cap-trajectory`
Expected: FAIL — module introuvable.

**Step 3: Write implementation**
```tsx
// apps/web/components/sections/cap-trajectory.tsx
"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { computeLayout, type GoalLike, type Layout } from "../../lib/cap-geometry";
import styles from "./cap-trajectory.module.css";

/** Étoiles décoratives déterministes (pas de Math.random → SSR stable). */
function StarField({ count }: { count: number }) {
  const stars = Array.from({ length: count }, (_, i) => {
    const x = (i * 53) % 100;
    const y = (i * 29) % 100;
    const sz = 0.6 + ((i * 7) % 16) / 10;
    const o = 0.18 + ((i * 11) % 50) / 100;
    const gold = i % 5 === 0;
    return (
      <span
        key={i}
        style={{
          left: `${x}%`, top: `${y}%`, width: `${sz}px`, height: `${sz}px`,
          opacity: o, animationDelay: `${(i % 40) / 10}s`,
          ["--o" as string]: o, ...(gold ? { background: "var(--accent)" } : {}),
        } as CSSProperties}
      />
    );
  });
  return <div className={styles.stars} aria-hidden>{stars}</div>;
}

function kindClass(kind: string): string {
  return styles[kind] ?? "";
}

/** Rend un graphe (desktop horizontal ou mobile vertical) à partir d'un Layout. */
function Chart({ layout, variant }: { layout: Layout; variant: "chart" | "mchart" }) {
  const { nodes, solidPath, dashedPath, areaPath, viewBox } = layout;
  const idp = variant; // suffixe d'id de gradient unique par variante
  return (
    <>
      <svg viewBox={`0 0 ${viewBox.w} ${viewBox.h}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`ln-${idp}`} x1="0" y1={variant === "mchart" ? "1" : "0"} x2={variant === "mchart" ? "0" : "1"} y2="0">
            <stop offset="0" stopColor="#9a6000" />
            <stop offset="1" stopColor="#f0a800" />
          </linearGradient>
          {areaPath ? (
            <linearGradient id={`ar-${idp}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(240,168,0,.24)" />
              <stop offset="1" stopColor="rgba(240,168,0,0)" />
            </linearGradient>
          ) : null}
        </defs>
        {areaPath ? <path className={styles.area} d={areaPath} fill={`url(#ar-${idp})`} /> : null}
        {dashedPath ? (
          <path d={dashedPath} fill="none" stroke="#3a3d41" strokeWidth="2" strokeDasharray="1 8"
                strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        ) : null}
        {solidPath ? (
          <>
            <path d={solidPath} fill="none" stroke="rgba(240,168,0,.16)" strokeWidth="11"
                  strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={solidPath} fill="none" stroke={`url(#ln-${idp})`} strokeWidth="3"
                  strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </>
        ) : null}
      </svg>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {nodes.map((nd) => (
          <li
            key={nd.goal.id}
            className={`${styles.node} ${kindClass(nd.view.kind)} ${nd.isDest ? styles.dest : ""}`}
            style={{ left: `${nd.leftPct}%`, top: `${nd.topPct}%`, ["--d" as string]: `${nd.delay}s` } as CSSProperties}
          >
            <span className={styles.dot} aria-hidden>
              <svg className={styles.check} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            </span>
            {nd.view.kind === "now" ? (
              <>
                <span className={`${styles.ping}`} aria-hidden />
                <span className={`${styles.ping} ${styles.p2}`} aria-hidden />
                <span className={styles.here} aria-hidden>▲ Vous êtes ici</span>
              </>
            ) : null}
            {(nd.view.kind === "next" || nd.view.kind === "far") ? <span className={styles.beacon} aria-hidden /> : null}
            {nd.isDest ? (
              <>
                <span className={styles.spark} aria-hidden />
                <span className={styles.ring} aria-hidden />
                <span className={`${styles.ring} ${styles.r2}`} aria-hidden />
              </>
            ) : null}
            <span className={styles.label}>
              <span className={styles.name}>{nd.goal.role}</span>
              <span className={styles.tag}>{nd.view.label}</span>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Trajectoire de carrière « Le cap ».
 * Desktop : courbe horizontale ascendante. Mobile : trajectoire verticale dans un
 * sticky-pin (le bloc se fige le temps de l'anim, puis on continue de scroller).
 * Reveal auto au bon seuil de visibilité ; respecte prefers-reduced-motion.
 */
export function CapTrajectory({ goals }: { goals: GoalLike[] }) {
  const desktop = computeLayout(goals, "horizontal");
  const mobile = computeLayout(goals, "vertical");
  const chartRef = useRef<HTMLDivElement>(null);
  const mchartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = [chartRef.current, mchartRef.current].filter(
      (el): el is HTMLDivElement => el !== null,
    );
    if (reduced) {
      targets.forEach((el) => el.classList.add(styles.play));
      return;
    }
    const observers = targets.map((el) => {
      const ratio = el === mchartRef.current ? 0.85 : 0.35; // mobile : quasi plein écran
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting && e.intersectionRatio >= ratio && (e.target as HTMLElement).offsetParent !== null) {
              e.target.classList.add(styles.play);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: [ratio] },
      );
      io.observe(el);
      return io;
    });
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Desktop */}
      <div className={styles.chart} ref={chartRef}>
        <StarField count={70} />
        <Chart layout={desktop} variant="chart" />
      </div>
      <div className={styles.axis}><span>Départ</span><span>Le cap →</span></div>

      {/* Mobile : sticky-pin */}
      <div className={styles.track}>
        <div className={styles.pin}>
          <div className={styles.mchart} ref={mchartRef}>
            <StarField count={55} />
            <Chart layout={mobile} variant="mchart" />
          </div>
        </div>
      </div>
    </div>
  );
}
```
> Note SSR : on n'ajoute `.play` qu'au montage client. Le markup (liste + SVG) est rendu côté serveur → le contenu textuel reste lisible (SEO/no-JS). L'état « caché » (`opacity:0`) provient du CSS module ; si on veut garantir une lisibilité totale sans JS, voir Task 3.3 (option garde `.js`). On suit ici le pattern maison (`ScrollReveal`), qui masque aussi par défaut.

**Step 4: Run test to verify it passes**
Run: `pnpm --filter web test cap-trajectory`
Expected: PASS.

**Step 5: Commit**
```bash
rtk git add apps/web/components/sections/cap-trajectory.tsx apps/web/components/sections/cap-trajectory.test.tsx
rtk git commit -m "feat(web): add CapTrajectory client component"
```

---

### Task 3.2 : Brancher dans `cap.tsx` (server) + MAJ tests
**Files:**
- Modify: `apps/web/components/sections/cap.tsx`
- Modify: `apps/web/components/sections/cap.test.tsx`

**Step 1: Adapter le test existant** (le compteur reste, la liste à cases devient la trajectoire)
```tsx
// apps/web/components/sections/cap.test.tsx — remplacer le corps du test
test("Cap affiche le compteur d'atteints et la trajectoire", () => {
  const goals = [
    { id: "g1", role: "Développeur", status: "ACHIEVED" },
    { id: "g2", role: "CTO", status: "TARGET" },
  ] as unknown as HomeData["goals"];

  render(<Cap section={section} goals={goals} />);
  expect(screen.getByText("01 / 02 atteints")).toBeInTheDocument();
  expect(screen.getAllByText("Développeur").length).toBeGreaterThan(0);
});
```

**Step 2: Run to verify it fails**
Run: `pnpm --filter web test sections/cap.test`
Expected: FAIL (Cap rend encore l'ancienne liste / pas de trajectoire).

**Step 3: Modifier `cap.tsx`** — garder l'en-tête + compteur, remplacer la liste par `<CapTrajectory>`
```tsx
// apps/web/components/sections/cap.tsx
import type { HomeData } from "../../lib/data/home";
import { CapTrajectory } from "./cap-trajectory";
import type { GoalLike } from "../../lib/cap-geometry";

type Section = HomeData["sections"][number];

/** Cap chapter: career goals as an ascending cosmic trajectory + achieved/total counter. */
export function Cap({ section, goals }: { section: Section; goals: HomeData["goals"] }) {
  const achieved = goals.filter((g) => g.status === "ACHIEVED").length;
  const total = goals.length;

  return (
    <section className="chapter" id="goals">
      <div className="wrap">
        {section.eyebrow ? <div className="marker reveal">{section.eyebrow}</div> : null}
        {section.title ? <h2 className="reveal">{section.title}</h2> : null}
        {section.intro ? <p className="txt reveal">{section.intro}</p> : null}

        <div className="obj-head reveal">
          <span className="t">Objectifs de carrière</span>
          <span className="c">
            {String(achieved).padStart(2, "0")} / {String(total).padStart(2, "0")} atteints
          </span>
        </div>

        <CapTrajectory goals={goals as unknown as GoalLike[]} />
      </div>
    </section>
  );
}
```

**Step 4: Run to verify it passes**
Run: `pnpm --filter web test sections/cap`
Expected: PASS.

**Step 5: Commit**
```bash
rtk git add apps/web/components/sections/cap.tsx apps/web/components/sections/cap.test.tsx
rtk git commit -m "feat(web): wire CapTrajectory into Cap section"
```

---

### Task 3.3 : Nettoyage des styles obsolètes
**Files:**
- Modify: `apps/web/app/globals.css`

**Step 1:** Vérifier que `.obj ul`, `.obj li`, `.box`, `.is-done/.is-now/.is-next/.is-far`, `.role`, `.stt` ne sont plus utilisés ailleurs.
Run: `rtk grep -n "className=\"box\"\|is-done\|is-now\|\.stt\|obj ul" apps/web`
Expected: plus aucune référence JSX (seul `.obj-head .t/.c` reste, gardé).

**Step 2:** Retirer de `globals.css` les règles devenues mortes (`.obj ul`, `.obj li`, `.box*`, `.is-*`, `.role`, `.stt`), **garder** `.obj-head` (+ `.t`/`.c`).

**Step 3:** Vérifier build/test.
Run: `pnpm --filter web test && rtk tsc -p apps/web`
Expected: vert.

**Step 4: Commit**
```bash
rtk git add apps/web/app/globals.css
rtk git commit -m "refactor(web): drop obsolete cap checklist styles"
```

---

## Phase 4 — Validation navigateur (web) — NON-NÉGOCIABLE

### Task 4.1 : Parcours réel MCP Playwright (desktop + mobile)
**Steps (MCP Playwright, app dev sur :3100, locale FR) :**
1. `browser_navigate` → `http://localhost:3100/fr` (ou la home), scroller jusqu'à la section `#goals`.
2. **Desktop (1280×900)** : vérifier le reveal horizontal (ligne se trace, jalons cochés, soleil, étoile-cap), screenshot.
3. **Mobile (390×844)** : vérifier le **sticky-pin** (bloc figé pendant l'anim) + reveal **bas→haut** + scroll qui continue après ; vérifier que **la ligne relie bien les nœuds** (pas le bug `width:0`). Screenshots mi-anim + final.
4. **DOM check** (comme en mockup) : `runReveal`/`.play` ajouté au bon seuil ; nœuds `.play` progressifs.
5. **Réduire les animations** (emulate `prefers-reduced-motion`) : tout visible, pas d'anim.
6. Nettoyer les screenshots hors repo.

**Critère d'acceptation :** rendu fidèle au mockup desktop + mobile, UX agréable, aucune régression de scroll sur le reste de la page.

---

## Phase 5 — Back office : éditer & réordonner les objectifs

### Task 5.1 : Schéma Zod d'update
**Files:**
- Modify: `packages/core/src/admin/content-schemas.ts`
- Modify: `packages/core/src/index.ts` (export)
- Test: `packages/core/src/admin/content-schemas.test.ts` (ou fichier de tests schémas existant)

**Step 1: Write the failing test**
```ts
// packages/core/src/admin/content-schemas.test.ts (ajouter)
import { CareerGoalUpdate } from "./content-schemas";
test("CareerGoalUpdate exige un id et valide le statut", () => {
  expect(CareerGoalUpdate.safeParse({ id: "g1", role: "CTO", status: "TARGET", order: 2 }).success).toBe(true);
  expect(CareerGoalUpdate.safeParse({ role: "CTO", status: "TARGET" }).success).toBe(false); // id manquant
  expect(CareerGoalUpdate.safeParse({ id: "g1", role: "X", status: "NOPE" }).success).toBe(false);
});
```

**Step 2: Run → FAIL** : `pnpm --filter @portfolio/core test content-schemas`

**Step 3: Implémenter**
```ts
// packages/core/src/admin/content-schemas.ts (après CareerGoalInput)
export const CareerGoalUpdate = CareerGoalInput.extend({ id: z.string().min(1) });
export type CareerGoalUpdate = z.infer<typeof CareerGoalUpdate>;
```
```ts
// packages/core/src/index.ts — ajouter à l'export des schémas
CareerGoalUpdate,
```

**Step 4: Run → PASS**

**Step 5: Commit**
```bash
rtk git add packages/core/src/admin/content-schemas.ts packages/core/src/index.ts packages/core/src/admin/content-schemas.test.ts
rtk git commit -m "feat(core): add CareerGoalUpdate schema"
```

### Task 5.2 : Lib BO — updateGoal + moveGoal
**Files:**
- Modify: `apps/admin/lib/content/career.ts`

**Step 1: Implémenter** (miroir des helpers existants `createGoal`/`deleteGoal`)
```ts
import { CareerGoalUpdate } from "@portfolio/core";

/** Updates a goal's role/status/order. */
export async function updateGoal(prisma: PrismaClient, raw: unknown) {
  const { id, ...data } = CareerGoalUpdate.parse(raw);
  return prisma.careerGoal.update({ where: { id }, data });
}

/** Moves a goal up/down by swapping `order` with its neighbour. */
export async function moveGoal(prisma: PrismaClient, id: string, dir: "up" | "down") {
  const goals = await prisma.careerGoal.findMany({ orderBy: { order: "asc" } });
  const i = goals.findIndex((g) => g.id === id);
  if (i < 0) return;
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= goals.length) return;
  await prisma.$transaction([
    prisma.careerGoal.update({ where: { id: goals[i].id }, data: { order: goals[j].order } }),
    prisma.careerGoal.update({ where: { id: goals[j].id }, data: { order: goals[i].order } }),
  ]);
}
```

**Step 2:** Vérifier la compilation.
Run: `rtk tsc -p apps/admin`
Expected: vert.

**Step 3: Commit**
```bash
rtk git add apps/admin/lib/content/career.ts
rtk git commit -m "feat(admin): add updateGoal + moveGoal helpers"
```

### Task 5.3 : Server Actions
**Files:**
- Modify: `apps/admin/lib/actions/content-actions.ts`

**Step 1: Implémenter** (mêmes garde-fous que `createGoalAction` : `requireEnrolledSession`, `revalidatePath`)
```ts
import { updateGoal, moveGoal } from "@/lib/content/career";

export async function updateGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  await updateGoal(prisma, {
    id: str(form, "id"),
    role: str(form, "role"),
    status: str(form, "status") ?? "TARGET",
    order: Number(form.get("order") ?? 0),
  });
  revalidatePath("/parcours");
}

export async function moveGoalAction(form: FormData): Promise<void> {
  await requireEnrolledSession();
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? "up" : "down";
  if (id) await moveGoal(prisma, id, dir);
  revalidatePath("/parcours");
}
```
> Note : le site **web** est une app séparée ; `revalidatePath('/parcours')` ne le rafraîchit pas. Vérifier que la home web lit la DB en dynamique (ou ISR court) pour refléter les éditions. Si besoin, traiter dans une tâche dédiée (hors périmètre ici).

**Step 2:** `rtk tsc -p apps/admin` → vert.

**Step 3: Commit**
```bash
rtk git add apps/admin/lib/actions/content-actions.ts
rtk git commit -m "feat(admin): add updateGoalAction + moveGoalAction"
```

### Task 5.4 : UI BO — édition inline + ↑/↓
**Files:**
- Modify: `apps/admin/app/(dashboard)/parcours/page.tsx`

**Step 1:** Remplacer le `<li>` lecture-seule des goals par : un `<form action={updateGoalAction}>` (hidden `id`, input `role`, `<select name="status">`, hidden `order`, bouton « Enregistrer ») + deux `<form action={moveGoalAction}>` (hidden `id` + `dir` `up`/`down`, boutons ↑/↓) + le `deleteGoalAction` existant. Réutiliser la constante `input` et `GOAL_STATUS` déjà présentes.

**Step 2:** Vérifier compilation + lint.
Run: `rtk tsc -p apps/admin && rtk lint apps/admin`
Expected: vert.

**Step 3: Commit**
```bash
rtk git add "apps/admin/app/(dashboard)/parcours/page.tsx"
rtk git commit -m "feat(admin): inline edit + reorder career goals"
```

### Task 5.5 : Seed des objectifs réels (si absent)
**Files:**
- Modify: `packages/db/prisma/seed-content.ts`

**Step 1:** Vérifier/compléter le seed des 8 objectifs réels avec `order` croissant et **un seul** `IN_PROGRESS` (Développeur→Salarié→Ingénieur→Gestionnaire ACHIEVED ; Indépendant·fondateur IN_PROGRESS ; Manager/CTO TARGET ; CEO HORIZON).
Run: `pnpm --filter @portfolio/db prisma db seed` (en dev) — Expected: 8 `CareerGoal`.

**Step 2: Commit** (si modifié)
```bash
rtk git add packages/db/prisma/seed-content.ts
rtk git commit -m "chore(db): seed real career goals for the cap"
```

---

## Phase 6 — Validation BO→Web + E2E

### Task 6.1 : Parcours réel MCP (BO durci) → reflet web
**Steps :**
1. Login dev BO (via `quickLoginAction` si dispo) → page `/parcours`.
2. **Éditer** un objectif (changer statut TARGET→IN_PROGRESS), **réordonner** (↑/↓), screenshots.
3. Recharger la **home web** → vérifier que la trajectoire reflète le changement (le « soleil » a bougé / ordre changé).
4. Vérifier les garde-fous : action sans session → 401/redirect (test existant du pattern admin).

---

## Phase 7 — Documentation & livraison

### Task 7.1 : MAJ docs
**Files:**
- `PROGRESS.md` (état + dernière livraison), `.claude/TASKS.md` (cocher l'item Goal/cap, retirer du backlog),
- `docs/patch_notes/patch_note_V{major}_{minor}.md` (entrée datée),
- `docs/technical/API_REFERENCE.md` (nouvelles actions `updateGoalAction`/`moveGoalAction`).
> ARCHITECTURE/SECURITY : inchangés (pas de service/réseau/posture nouveaux).

**Commit:**
```bash
rtk git add PROGRESS.md .claude/TASKS.md docs/
rtk git commit -m "docs: update for cap trajectory + goal editing"
```

### Task 7.2 : PR `llm → dev`
**Steps :**
1. `rtk git push origin llm`.
2. Ouvrir la PR `llm → dev` (atomique : « feat: cap trajectory + BO goal editing »).
3. Attendre la CI **verte** (`lint · typecheck · test · build`). Rouge → corriger jusqu'au vert.
4. PR verte + sans conflit → **merge auto** (règle projet). Conflit → demander l'autorisation.
5. `dev → main` + tag : **réservé à l'utilisateur** (ne pas y toucher).

---

## Edge cases & risques (checklist)
- [ ] **0 objectif** → graphe vide sans crash ; **1 objectif** → point seul, pas de courbe cassée.
- [ ] **0 IN_PROGRESS** → frontière = dernier ACHIEVED ; **plusieurs IN_PROGRESS** → on prend le premier (documenté).
- [ ] **> 10 objectifs** → débordement du pin mobile (74vh) : prévoir hauteur adaptative ou cap (à traiter si le cas réel dépasse ~8).
- [ ] **`prefers-reduced-motion`** → tout visible, zéro animation (desktop + mobile).
- [ ] **A11y** : `<ul>/<li>` lisibles par lecteur d'écran ; SVG + pings/halo en `aria-hidden`.
- [ ] **SSR/SEO** : contenu textuel présent au rendu serveur.
- [ ] **Sticky-pin** : ne casse pas le scroll des autres sections ni `ScrollReveal` global.
- [ ] **Cross-app** : édition BO visible sur le web (dépend du mode de rendu de la home).
- [ ] **Tokens** : aucune couleur en dur ajoutée hors valeurs rgba déjà présentes dans le mockup (à terme, candidates à tokeniser).
```
