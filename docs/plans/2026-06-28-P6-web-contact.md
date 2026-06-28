# P6 — Web: Contact & demande de RDV — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`.

**Goal:** Formulaire de contact public (→ `ContactMessage`) et formulaire de demande de RDV (→ `AppointmentRequest`), tous deux **insert-only** côté `app_web`, validés et anti-spam.

**Architecture:** Route Handlers (Zod + honeypot + rate-limit de P5), modules de formulaire client. Aucune lecture côté web (PII protégée par les grants). Modulaire.

**Tech Stack:** Next.js 16, Prisma 7, Zod, rate-limiter (P5), Vitest, Playwright.

---

### Task 1: Schémas Zod

**Files:** `packages/core/src/contact/schema.ts` (+ test).
`ContactInput {name, email, subject?, message}` et `AppointmentInput {name, email, topic?, message?, requestedAt?}`. Bornes, email valide. **Commit** `feat(core): contact & appointment schemas`.

---

### Task 2: Endpoint contact

**Files:** `apps/web/app/api/contact/route.ts` (+ test).
`POST` → Zod → honeypot → rate-limit IP → `prisma.contactMessage.create` (`ip`/`userAgent`). 201/400/429. **Test** : message créé ; invalide 400 ; spam-limite 429. **Commit** `feat(web): contact endpoint`.

---

### Task 3: Endpoint RDV

**Files:** `apps/web/app/api/appointments/route.ts` (+ test).
Idem, `source="CONTACT"`, `status` défaut `PENDING` (non fourni). **Commit** `feat(web): appointment request endpoint`.

---

### Task 4: Modules formulaires + section

**Files:** `apps/web/components/contact-form/*`, `apps/web/components/appointment-form/*` (clients), `apps/web/components/sections/contact.tsx`.
États envoi/succès/erreur, honeypot caché, a11y (labels/aria). Tests RTL (validation, succès). **Commit** `feat(web): contact & appointment form modules`.

---

### Task 5: E2E

`e2e/contact.spec.ts` : envoi valide → message de succès ; champ manquant → erreur inline. **Commit** `test(e2e): contact form`.

---

## Definition of Done (P6)
- Contact + RDV insert-only (`app_web`), Zod + honeypot + rate-limit, modules réutilisables, testés (unit + E2E). Aucune lecture de PII côté web.
