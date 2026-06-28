# P11 — Admin: Articles (programmation) & upload média — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware + assist IA (P14).

**Goal:** CRUD des actualités avec **publication programmée** (date/heure), galerie **images & vidéos**, lien évènement, et **pipeline d'upload sécurisé** (image → converter webp + strip EXIF → MinIO → `MediaAsset`).

**Architecture:** Server Actions (`app_admin`) + Zod. Upload via une action serveur qui : valide mime/taille/dimensions → appelle le **converter** (HTTP interne) → écrit dans **MinIO** (credentials serveur) → crée `MediaAsset`. Vidéos : upload direct/embed (contournent webp). Programmation : `status=SCHEDULED` + `scheduledAt` ; bascule par le cron (P4/P1).

**Tech Stack:** Next.js 16 Server Actions, Prisma 7, converter/MinIO, Zod, Vitest, Playwright.

---

### Task 1: CRUD Article

**Files:** `apps/admin/lib/actions/articles.ts` (+ test), écran `app/(dashboard)/actus/*`.
Champs : titre/slug/excerpt/**content** (LocalizedField FR/EN), tags, cover,
status (DRAFT/**SCHEDULED**/PUBLISHED), **scheduledAt** (date+heure), SEO, lien
évènement, galerie. **Test** : passer en SCHEDULED exige `scheduledAt` futur.
**Commit** `feat(admin): article CRUD with scheduling`.

---

### Task 2: Service d'upload (sécurisé, TDD avec mocks)

**Files:** `apps/admin/lib/media/upload.ts` (+ test), `packages/core/src/media/validate.ts` (+ test).
- `validateUpload(file)` (mime image autorisé, taille/dimensions max) — pur, testé.
- `uploadImage(file)` : `validate` → `convertToWebp(file)` (port converter, **mocké**
  en test) → `putObject` MinIO (port, **mocké**) → `createMediaAsset` (URL, dims,
  `kind=IMAGE`). **Test** : mime invalide rejeté ; flux nominal crée un `MediaAsset`.
**Commit** `feat(admin): secure image upload pipeline`.

---

### Task 3: Vidéo / embed

**Files:** `apps/admin/lib/media/video.ts` (+ test).
`addVideo({ file|externalUrl, provider })` → `MediaAsset` `kind=VIDEO|EMBED`
(poster, durée optionnels). Pas de conversion webp. **Commit** `feat(admin): video/embed media`.

---

### Task 4: Modules UI

**Files:** `apps/admin/components/media-uploader/*`, `apps/admin/components/gallery-manager/*`,
`apps/admin/components/schedule-picker/*` (date+heure).
Tests RTL. **Commit** `feat(admin): media & scheduling UI modules`.

---

### Task 5: E2E

`e2e/admin-articles.spec.ts` : créer une actu programmée (scheduledAt passé pour
le test) → après appel du cron de bascule → visible côté public. **Commit**
`test(e2e): scheduled article publishes via cron`.

---

## Definition of Done (P11)
- CRUD article + programmation (date/heure) + galerie images/vidéos + lien évènement.
- Upload sécurisé (validation + converter webp/EXIF + MinIO), ports mockés en test.
- Bascule programmée vérifiée E2E.
