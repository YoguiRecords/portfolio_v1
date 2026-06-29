# P8 — Admin: Shell BO & gardes de routes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`.

**Goal:** Coquille du back office (layout, navigation, tableau de bord) avec **toutes les routes protégées** par l'auth/MFA existante (`apps/admin/lib/auth/guards`).

**Architecture:** Layout BO modulaire (`AdminLayout`, `AdminNav`), garde serveur appliquée à `app/(dashboard)/**` (session valide + MFA complet sinon redirect login/verify). Réutilise `guards`/`session` existants. Composants présentational + CSS Modules.

**Tech Stack:** Next.js 16 RSC, auth existant, Vitest+RTL, Playwright.

---

### Task 1: Garde de groupe `(dashboard)`

**Files:** Create `apps/admin/app/(dashboard)/layout.tsx`, Test `apps/admin/lib/auth/require-admin.test.ts` (si non couvert).
**Test d'abord** : sans session → redirect `/login` ; session `mfaPending` → `/login/verify` ; session complète → rendu. (réutiliser `guards`.) **Commit** `feat(admin): protected dashboard layout`.

---

### Task 2: Modules `AdminNav` + `AdminLayout`

**Files:** `apps/admin/components/admin-nav/*`, `apps/admin/components/admin-layout/*`.
Nav vers les sections du BO (Profil/Réglages, Contenu home, Projets, Articles, Agenda, Témoignages, Inbox, IA). Test RTL : liens présents, item actif. **Commit** `feat(admin): BO shell modules`.

---

### Task 3: Dashboard

**Files:** `apps/admin/app/(dashboard)/page.tsx` (composition) + module `dashboard-stats` (compte projets/actus/témoignages PENDING/messages non lus).
**Commit** `feat(admin): dashboard overview`.

---

### Task 4: E2E

`e2e/admin-auth.spec.ts` : accès direct à une route BO sans session → `/login` ;
après login+TOTP (compte de test seedé via `seed.ts`) → dashboard visible.
**Commit** `test(e2e): admin route guards`.

---

## Definition of Done (P8)
- Toutes les routes BO protégées (session + MFA). Shell modulaire + dashboard.
- E2E garde + accès authentifié vert.
