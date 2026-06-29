# Phase 0 — Design system & tokens — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL — utiliser `superpowers:executing-plans` pour implémenter ce plan tâche par tâche. Phase 0 de la feuille de route `docs/plans/2026-06-29-bo-v2-roadmap.md`.

**Goal :** poser la fondation visuelle réutilisable du BO v2 (tokens Tailwind v4 + primitives UI sans couleur en dur), fidèle à `mockups/bo/assets/bo.css`, pour que les phases suivantes assemblent des pages au lieu de redessiner.

**Architecture :** thème centralisé dans le bloc `@theme` de `globals.css` (graphite noir/gris + accent or + statuts), puis un dossier `apps/admin/components/ui/` de primitives. TDD sur les composants à **logique** (DataTable, Switch, Segmented, Pagination) ; les primitives purement présentationnelles sont vérifiées par un test de rendu minimal (rôle + classes clés).

**Tech Stack :** Next.js 16 (App Router), React 19, TypeScript strict, Tailwind v4, Vitest + React Testing Library.

**Convention tests :** dans `apps/admin`, lancer `pnpm --filter admin test` (Vitest). Pour un fichier : `pnpm --filter admin exec vitest run <chemin-relatif-à-apps/admin>`. AAA, un comportement par test.

**Réf. visuelle / valeurs :** `mockups/bo/assets/bo.css` (tokens), `mockups/bo/v2/*` (usage réel).

---

## Pré-requis
- Brancher sur `llm`, partir d'un arbre propre (`rtk git status`).
- Repérer le fichier CSS global de l'admin (probablement `apps/admin/app/globals.css`) qui contient déjà `@import "tailwindcss"`. **Adapter le chemin si différent.**

---

### Task 0.1 : Tokens du thème (Tailwind v4 `@theme`)

**Files:**
- Modify: `apps/admin/app/globals.css`

**Step 1 : Ajouter le bloc `@theme` (mapping des tokens v2)**

Sous l'`@import "tailwindcss";` existant, ajouter (valeurs issues de `mockups/bo/assets/bo.css`) :

```css
@theme {
  /* Accent or signature */
  --color-accent: #f0a800;
  --color-accent-strong: #c07800;

  /* Surfaces graphite (noir/gris — pas de bleu) */
  --color-bg: #0d0e10;
  --color-surface: #16181b;
  --color-surface-2: #1c1f23;
  --color-elevated: #22262b;
  --color-border: #24272c;
  --color-border-strong: #31353b;

  /* Texte */
  --color-ink: #f1f2f4;
  --color-ink-2: #b3b9c0;
  --color-muted: #79808a;

  /* Statuts */
  --color-ok: #3fb27f;
  --color-warn: #e0902f;
  --color-danger: #e0606e;
  --color-info: #5b9bd5;

  /* Rayons */
  --radius-card: 10px;
  --radius-control: 8px;
}
```

**Step 2 : Vérifier la compilation**

Run: `pnpm --filter admin exec next build` (ou `pnpm --filter admin dev` et ouvrir une page)
Expected: build OK, classes `bg-bg`, `text-ink`, `text-accent`, `border-border` disponibles.

**Step 3 : Commit**

```bash
rtk git add apps/admin/app/globals.css
rtk git commit -m "feat(admin): add BO v2 design tokens to Tailwind theme"
```

---

### Task 0.2 : `Status` (badge de statut)

**Files:**
- Create: `apps/admin/components/ui/status.tsx`
- Test: `apps/admin/components/ui/status.test.tsx`

**Step 1 : Écrire le test qui échoue**

```tsx
import { render, screen } from "@testing-library/react";
import { Status } from "./status";

describe("Status", () => {
  it("rend le libellé et la classe du variant publié", () => {
    render(<Status variant="published">Publié</Status>);
    const el = screen.getByText("Publié");
    expect(el).toHaveAttribute("data-variant", "published");
  });
});
```

**Step 2 : Lancer le test → échec attendu**

Run: `pnpm --filter admin exec vitest run components/ui/status.test.tsx`
Expected: FAIL « Cannot find module './status' ».

**Step 3 : Implémentation minimale**

```tsx
const STYLES = {
  published: "text-ok bg-ok/15",
  review: "text-warn bg-warn/15",
  draft: "text-muted bg-surface-2",
  archived: "text-info bg-info/15",
} as const;

export type StatusVariant = keyof typeof STYLES;

/** Pastille de statut (publié / en revue / brouillon / archivé). */
export function Status({ variant, children }: { variant: StatusVariant; children: React.ReactNode }) {
  return (
    <span
      data-variant={variant}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[variant]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}
```

**Step 4 : Lancer le test → succès**

Run: `pnpm --filter admin exec vitest run components/ui/status.test.tsx`
Expected: PASS.

**Step 5 : Commit**

```bash
rtk git add apps/admin/components/ui/status.tsx apps/admin/components/ui/status.test.tsx
rtk git commit -m "feat(admin): add Status badge primitive"
```

---

### Task 0.3 : `Button`

**Files:**
- Create: `apps/admin/components/ui/button.tsx`
- Test: `apps/admin/components/ui/button.test.tsx`

**Step 1 : Test qui échoue** — variant + clic.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

it("déclenche onClick et applique le variant primary", async () => {
  const onClick = vi.fn();
  render(<Button variant="primary" onClick={onClick}>OK</Button>);
  await userEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(onClick).toHaveBeenCalledOnce();
});
```

**Step 2 : Run → FAIL** (`pnpm --filter admin exec vitest run components/ui/button.test.tsx`).

**Step 3 : Implémentation** — variants `primary | ghost | subtle | danger`, taille `sm`, props natives `button`, classes via tokens (`bg-accent text-[#1a1400]`, etc.). Forward `...props`.

**Step 4 : Run → PASS.**

**Step 5 : Commit** `feat(admin): add Button primitive`.

---

### Task 0.4 : `KpiCard`

**Files:**
- Create: `apps/admin/components/ui/kpi-card.tsx`
- Test: `apps/admin/components/ui/kpi-card.test.tsx`

**Step 1 : Test** — affiche label, valeur, et flèche selon `trend` (`up|down|flat`).

```tsx
render(<KpiCard label="Visiteurs" value="2 480" trend="up" delta="+14 %" />);
expect(screen.getByText("2 480")).toBeInTheDocument();
expect(screen.getByText(/\+14 %/)).toHaveAttribute("data-trend", "up");
```

**Step 2 : Run → FAIL.**
**Step 3 : Implémentation** — carte `bg-surface border-border rounded-[--radius-card]`, valeur `text-3xl font-extrabold`, delta couleur selon trend (`up`→`text-ok`, `down`→`text-danger`, `flat`→`text-muted`).
**Step 4 : Run → PASS.**
**Step 5 : Commit** `feat(admin): add KpiCard primitive`.

---

### Task 0.5 : `DataTable` (cœur des listes CRUD)

**Files:**
- Create: `apps/admin/components/ui/data-table.tsx`
- Test: `apps/admin/components/ui/data-table.test.tsx`

API visée :
```ts
type Column<T> = { key: string; header: string; render: (row: T) => React.ReactNode; align?: "left" | "right" };
type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowActions?: (row: T) => React.ReactNode; // boutons éditer/aperçu/supprimer
  emptyLabel?: string;
};
```

**Step 1 : Tests qui échouent** (3 comportements)

```tsx
const cols = [{ key: "name", header: "Nom", render: (r) => r.name }];
const rows = [{ id: "1", name: "Domestic Revolt" }];

it("rend les en-têtes et les lignes", () => {
  render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} />);
  expect(screen.getByText("Nom")).toBeInTheDocument();
  expect(screen.getByText("Domestic Revolt")).toBeInTheDocument();
});

it("affiche l'état vide quand rows est vide", () => {
  render(<DataTable columns={cols} rows={[]} rowKey={(r) => r.id} emptyLabel="Aucun projet" />);
  expect(screen.getByText("Aucun projet")).toBeInTheDocument();
});

it("rend les actions de ligne", () => {
  render(<DataTable columns={cols} rows={rows} rowKey={(r) => r.id} rowActions={() => <button>Éditer</button>} />);
  expect(screen.getByRole("button", { name: "Éditer" })).toBeInTheDocument();
});
```

**Step 2 : Run → FAIL** (`pnpm --filter admin exec vitest run components/ui/data-table.test.tsx`).

**Step 3 : Implémentation minimale** — `<table>` avec `thead` (colonnes), `tbody` (lignes via `rowKey`), colonne d'actions si `rowActions`, `EmptyState` (Task 0.9) si `rows.length === 0`. Classes via tokens (`border-border`, hover `bg-surface-2`). Pas de tri en P0 (ajouté quand un écran en a besoin — YAGNI).

**Step 4 : Run → PASS.**

**Step 5 : Commit** `feat(admin): add DataTable primitive`.

---

### Task 0.6 : `Switch` (toggle)

**Files:** Create `apps/admin/components/ui/switch.tsx` + test.

**Step 1 : Test** — `role="switch"`, `aria-checked` reflète `checked`, `onCheckedChange` appelé au clic.
**Step 2 : Run → FAIL.**
**Step 3 : Implémentation** — bouton `role="switch"`, `aria-checked={checked}`, styles on/off via tokens (`bg-accent/15 border-accent` quand on).
**Step 4 : Run → PASS.**
**Step 5 : Commit** `feat(admin): add Switch primitive`.

---

### Task 0.7 : `Segmented` (filtres type onglets-pills)

**Files:** Create `apps/admin/components/ui/segmented.tsx` + test.

**Step 1 : Test** — rend les options ; clic sur une option appelle `onChange(value)` ; l'option active a `aria-pressed="true"`.
**Step 2 : Run → FAIL.** **Step 3 : Implémentation** (groupe de boutons, valeur active stylée). **Step 4 : Run → PASS.** **Step 5 : Commit** `feat(admin): add Segmented primitive`.

---

### Task 0.8 : `Pagination`

**Files:** Create `apps/admin/components/ui/pagination.tsx` + test.

**Step 1 : Test** — affiche le n° de page courant ; clic « › » appelle `onPageChange(page + 1)` ; « ‹ » désactivé en page 1.
**Step 2–4 :** FAIL → implémentation → PASS. **Step 5 : Commit** `feat(admin): add Pagination primitive`.

---

### Task 0.9 : Primitives présentationnelles (rendu simple)

Une primitive par fichier, chacune avec **un** test de rendu (présence du rôle/texte + classe clé). Commit groupé possible si triviales.

**Files (Create + test pour chacune) :**
- `apps/admin/components/ui/card.tsx` — `Panel` (entête + corps + lien optionnel).
- `apps/admin/components/ui/field.tsx` — label + hint + slot.
- `apps/admin/components/ui/input.tsx`, `select.tsx`, `textarea.tsx` — inputs stylés (focus ring accent), forward `...props`.
- `apps/admin/components/ui/tag.tsx` — chip techno (teinte or).
- `apps/admin/components/ui/avatar.tsx` — image ronde + fallback initiales.
- `apps/admin/components/ui/toolbar.tsx` — barre (recherche + filtres + actions).
- `apps/admin/components/ui/save-bar.tsx` — barre sticky bas (statut « Enregistré » + actions).
- `apps/admin/components/ui/empty-state.tsx` — icône + message + CTA (utilisé par `DataTable`).
- `apps/admin/components/ui/drawer.tsx` — panneau latéral (ouvert/fermé contrôlé), `role="dialog"`, fermeture Échap.

**Pour chacune :** Step 1 test de rendu → Step 2 FAIL → Step 3 implémentation → Step 4 PASS → Step 5 commit `feat(admin): add <name> primitive`.

> **NB :** le composant **`live-preview`** (aperçu temps réel fermable) n'est **pas** ici — il arrive en **P3** (Projets) où il a son premier usage réel (YAGNI). `PreviewFrame` (le chrome de navigateur, présentationnel) peut être posé ici si pratique, sinon en P3.

---

### Task 0.10 : Barrière de qualité Phase 0

**Step 1 :** lancer toute la suite — `pnpm --filter admin test`. Expected: tous verts.
**Step 2 :** typecheck — `pnpm --filter admin exec tsc --noEmit`. Expected: 0 erreur.
**Step 3 :** lint — `rtk lint`. Expected: 0 violation.
**Step 4 :** index des primitives — Create `apps/admin/components/ui/index.ts` réexportant tout ; commit `chore(admin): barrel export ui primitives`.
**Step 5 :** **Docs & PR** — mettre à jour `PROGRESS.md` (état) + `TASKS.md` (retirer P0) ; ouvrir la PR `llm → dev` « feat(admin): BO v2 design system (P0) ».

---

## Definition of Done (Phase 0)
- [ ] Tokens v2 dans `@theme`, aucune couleur en dur dans les primitives.
- [ ] Primitives créées + testées (logique en TDD), barrel export.
- [ ] `pnpm --filter admin test` / `tsc --noEmit` / `lint` verts.
- [ ] Aucune régression sur les pages existantes (elles n'utilisent pas encore les primitives).
- [ ] Docs à jour, PR `llm → dev` ouverte.
