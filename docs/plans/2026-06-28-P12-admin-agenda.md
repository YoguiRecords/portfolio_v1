# P12 — Admin: Agenda / Événements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware + assist IA (P14).

**Goal:** CRUD des événements (date/heure/lieu, lien d'inscription externe, public/fermé, programmation) et **génération rapide d'une actualité depuis un événement**.

**Architecture:** Server Actions (`app_admin`) + Zod. La génération d'actu pré-remplit un `Article` (titre/excerpt/content) depuis l'`Event` et le **lie** (`Article.eventId`). Version IA (rédaction auto) branchée en P14 ; ici, version **déterministe** (template) + édition. Modulaire.

**Tech Stack:** Next.js 16 Server Actions, Prisma 7, Zod, Vitest, Playwright.

---

### Task 1: CRUD Event

**Files:** `apps/admin/lib/actions/events.ts` (+ test), écran `app/(dashboard)/agenda/*`.
Champs : titre/slug, description (LocalizedField), **startAt/endAt** (date+heure,
timezone), lieu (nom/adresse/ville) **ou** online (`isOnline`+`onlineUrl`),
**`registrationUrl`** (externe), **`visibility` PUBLIC/PRIVATE**, status
(DRAFT/SCHEDULED/PUBLISHED) + scheduledAt, cover, galerie. **Test** : create +
slug unique ; `PRIVATE` non listé publiquement (vérifié via loader P4). **Commit**
`feat(admin): event CRUD`.

---

### Task 2: Générer une actu depuis l'événement (template, TDD)

**Files:** `apps/admin/lib/actions/event-to-article.ts` (+ test), `packages/core/src/agenda/draft-from-event.ts` (+ test).
`draftFromEvent(event)` (pur) → `{ title, excerpt, content }` (template FR :
« Je serai à <titre> le <date> à <lieu>… »). L'action crée un `Article`
`status=DRAFT` lié à l'event. **Test** : le brouillon contient le titre et la date
de l'event ; `Article.eventId` renseigné. **Commit** `feat(admin): generate article draft from event`.
> Variante **IA** (rédaction enrichie) : ajoutée en P14 (même action, port LLM).

---

### Task 3: Modules UI

**Files:** `apps/admin/components/event-form/*`, bouton « Créer une actu » (→ action,
redirige vers l'éditeur d'article pré-rempli). Tests RTL. **Commit** `feat(admin): event form & quick-article`.

---

### Task 4: E2E

`e2e/admin-agenda.spec.ts` : créer un event public publié → visible sur `/agenda` ;
« Créer une actu » → éditeur article pré-rempli avec le titre de l'event.
**Commit** `test(e2e): event publishing and quick article`.

---

## Definition of Done (P12)
- CRUD événements (date/heure/lieu/inscription externe/public-fermé/programmation).
- Génération d'actu déterministe depuis un event (IA en P14), liée à l'event.
- Tests unit + E2E.
