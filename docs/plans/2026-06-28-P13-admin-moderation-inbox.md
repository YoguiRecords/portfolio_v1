# P13 — Admin: Modération témoignages & inbox (contact/RDV) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`.

**Goal:** Modérer les témoignages (accepter / refuser / **éditer le texte**) et gérer les boîtes de réception (messages de contact, demandes de RDV) — toutes lues/écrites par `app_admin` uniquement.

**Architecture:** Server Actions (`app_admin`). La modération met à jour `status` (+ `approvedAt`) et permet d'éditer `content` (sans toucher `submittedContent` = audit). Inbox contact : lu/non-lu, spam. RDV : confirmer/refuser (→ option créer un `Event`). Modulaire.

**Tech Stack:** Next.js 16 Server Actions, Prisma 7, Zod, Vitest, Playwright.

---

### Task 1: Actions modération témoignages

**Files:** `apps/admin/lib/actions/testimonials.ts` (+ test).
`approve(id)` → `status=APPROVED`, `approvedAt=now` ; `reject(id)` → `REJECTED` ;
`editContent(id, content)` → maj `content` (jamais `submittedContent`) ; `feature(id)`.
**Test** : `approve` rend l'entrée visible côté public (loader P5) ; `editContent`
ne modifie pas l'original. **Commit** `feat(admin): testimonial moderation actions`.

---

### Task 2: Écran modération

**Files:** `app/(dashboard)/temoignages/*`, modules `moderation-list`, `moderation-card`
(affiche original vs édité, note, boutons accepter/refuser/éditer/mettre en avant).
Tests RTL. **Commit** `feat(admin): testimonial moderation screen`.

---

### Task 3: Inbox contact

**Files:** `apps/admin/lib/actions/contact.ts` (+ test), `app/(dashboard)/messages/*`.
Liste (non-lus en tête), `markRead`, `markSpam`. **Test** : `markRead` bascule le flag.
**Commit** `feat(admin): contact inbox`.

---

### Task 4: Demandes de RDV

**Files:** `apps/admin/lib/actions/appointments.ts` (+ test), `app/(dashboard)/rdv/*`.
Liste, `confirm(id)` (→ `CONFIRMED`, option créer un `Event` lié), `decline(id)`,
`cancel(id)`. **Test** : `confirm` change le statut ; création d'event liée
optionnelle. **Commit** `feat(admin): appointment requests management`.

---

### Task 5: E2E

`e2e/admin-moderation.spec.ts` : un témoignage `PENDING` seedé → l'approuver au BO
→ il apparaît sur le site. Un message de contact non-lu → `markRead`. **Commit**
`test(e2e): moderation and inbox`.

---

## Definition of Done (P13)
- Modération témoignages (accepter/refuser/éditer/mettre en avant), inbox contact
  (lu/spam), RDV (confirmer/refuser → event). `app_admin` only.
- Tests unit + E2E (approbation reflétée côté public).
