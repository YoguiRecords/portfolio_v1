# P5 — Web: Témoignages (affichage + soumission modérée) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware (P-i18n).

**Goal:** Afficher les témoignages **approuvés** et permettre au public d'en **soumettre** un (stocké `PENDING`, modéré au BO en P13). Sécurité : lecture des colonnes d'affichage uniquement, soumission sans auto-validation.

**Architecture:** Section/serveur lit les `APPROVED` via un **`select` explicite** (colonnes accordées à `app_web` — jamais email/IP/texte original, cf. grants migration). Le formulaire (module client) POST vers un **Route Handler** qui valide (Zod), applique **honeypot + rate-limit**, et insère `status=PENDING` (le rôle `app_web` ne peut pas définir `status`). Tout modulaire.

**Tech Stack:** Next.js 16, Prisma 7, Zod, rate-limiter léger, Vitest+RTL, Playwright.

---

### Task 1: Schéma Zod de soumission

**Files:** Create `packages/core/src/testimonials/schema.ts` + test.

**Test d'abord** : `TestimonialInput` accepte `{authorName, authorRole?, authorEmail?, content}` (longueurs bornées), rejette `content` vide ou trop long, ignore tout `status` fourni. **Commit** `feat(core): testimonial submission schema`.

---

### Task 2: Loader d'affichage (colonnes sûres)

**Files:** Create `apps/web/lib/data/testimonials.ts` + test.

**Test d'abord** : `listApprovedTestimonials` ne renvoie que les `APPROVED`, et le
`select` n'inclut **pas** `authorEmail`/`ip`/`submittedContent`. Vérifier qu'un
`PENDING` n'apparaît pas. **Commit** `feat(web): approved testimonials loader`.

---

### Task 3: Rate-limit util (TDD)

**Files:** Create `packages/core/src/security/rate-limit.ts` + test.

**Test d'abord** : `allow(key, {max:3, windowMs:60000})` autorise 3 fois puis
bloque ; refenêtrage après expiration (horloge injectable). Implémentation
in-memory (suffisant mono-instance ; doc note Redis si scale). **Commit**
`feat(core): in-memory rate limiter`.

---

### Task 4: Route Handler de soumission

**Files:** Create `apps/web/app/api/testimonials/route.ts` + test.

**Logique** : `POST` → parse Zod → **honeypot** (champ caché rempli ⇒ 200 silencieux,
ignoré) → **rate-limit** par IP → `prisma.testimonial.create` avec
`content = submittedContent = input.content`, `status` **non fourni** (défaut
`PENDING`), `ip`/`userAgent` capturés. Réponses : 201 (ok), 400 (zod), 429 (limite).
**Test** : soumission valide crée un `PENDING` ; payload invalide → 400 ; au-delà
de la limite → 429. **Commit** `feat(web): testimonial submission endpoint`.

---

### Task 5: Modules UI

**Files:** Create `apps/web/components/testimonial-card/*`, `apps/web/components/testimonial-form/*` (client).

- `TestimonialCard` (nom, rôle, note ★, contenu) — présentational pur, test RTL.
- `TestimonialForm` (client) : champs + honeypot caché + états (envoi/succès/erreur),
  POST vers l'API, message de remerciement (« en attente de validation »).
**Commit** `feat(web): testimonial card and submission form modules`.

---

### Task 6: Section + page

**Files:** Create `apps/web/components/sections/testimonials.tsx`; route éventuelle
`app/[locale]/temoignages/page.tsx`. Compositions only.
**Commit** `feat(web): testimonials section`.

---

### Task 7: E2E

**Files:** `e2e/testimonials.spec.ts` — un témoignage seedé `APPROVED` s'affiche ;
soumettre le formulaire montre le message « en attente » ; un `PENDING` **ne
s'affiche pas**. **Commit** `test(e2e): testimonials display and submission`.

---

## Definition of Done (P5)
- Affichage des `APPROVED` via `select` sûr (zéro PII exposée).
- Soumission → `PENDING` (jamais auto-validé), Zod + honeypot + rate-limit.
- Modules réutilisables + tests unit + E2E.
