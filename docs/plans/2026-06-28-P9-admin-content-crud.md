# P9 — Admin: CRUD du contenu home — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware (P-i18n), assist IA par champ (P14).

**Goal:** Éditer tout le contenu de la home : `Profile`, `SiteSettings`, `HomeSection`, `Kpi`, `Skill`, `CareerTrack`/`CareerMilestone`, `CareerGoal`, `Analysis`/`AnalysisItem`.

**Architecture:** **Pattern CRUD réutilisable** : Server Action (`app_admin`) + **Zod** + revalidation. Un module formulaire par entité, composé de champs réutilisables (`TextField`, `LocalizedField`, `OrderableList`, `ImagePicker`). Singletons (`Profile`, `SiteSettings`) = upsert. Réordonnancement via `order`. Mutations CSRF-safe (Server Actions Next).

**Tech Stack:** Next.js 16 Server Actions, Prisma 7 (`app_admin`), Zod, Vitest, Playwright.

---

### Task 1: Schémas Zod d'édition (core)

**Files:** `packages/core/src/admin/content-schemas.ts` (+ tests).
Un schéma par entité (champs requis/bornes). **Commit** `feat(core): admin content schemas`.

---

### Task 2: Helpers d'action réutilisables

**Files:** `apps/admin/lib/actions/crud.ts` (+ test).
`createResource/updateResource/deleteResource/reorder` génériques (parse Zod →
mutate → `revalidatePath`). **Test** : update invalide → erreur typée ; reorder
persiste l'ordre. **Commit** `feat(admin): reusable CRUD action helpers`.

---

### Task 3: Champs réutilisables

**Files:** `apps/admin/components/fields/*` (`text-field`, `textarea-field`,
`localized-field` (de P-i18n), `orderable-list`, `image-picker`, `select-field`).
Tests RTL par champ. **Commit** `feat(admin): reusable form field modules`.

---

### Task 4–11: Un écran par entité

> Pour CHAQUE entité : **test d'abord** (l'action crée/maj en DB de test), puis
> écran (liste + form composés des champs réutilisables), test vert, commit
> `feat(admin): <entity> editor`.

- `Profile` (hero : nom, headline, bio, **typewriterLines**, sigText, dispo,
  currentRole, avatar) — singleton.
- `SiteSettings` (SEO défauts, OG, footer, contact, **llms.txt**, politique IA) — singleton.
- `HomeSection` (eyebrow/title/intro/CTA + **order + visibilité**) — liste réordonnable.
- `Kpi`, `Skill` — listes réordonnables.
- `CareerTrack` + `CareerMilestone` (imbriqué, couleur, année).
- `CareerGoal` (statut).
- `Analysis` + `AnalysisItem` (SWOT/PESTEL/PORTER).

Champs texte traduisibles → `LocalizedField` (EN caché, FR écrase EN à la save).

---

### Task 12: E2E aller-retour

`e2e/admin-content.spec.ts` : éditer un `Kpi` au BO → la home publique reflète la
valeur (après revalidation). **Commit** `test(e2e): edit KPI reflects on site`.

---

## Definition of Done (P9)
- Tout le contenu home éditable au BO (Server Actions `app_admin` + Zod).
- Champs réutilisables (dont `LocalizedField`), réordonnancement, singletons upsert.
- Tests unit (actions) + E2E (édition reflétée côté public).
