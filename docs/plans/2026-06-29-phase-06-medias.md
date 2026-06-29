# Phase 6 — Médias — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 6 de la roadmap. Pré-requis : **P1 mergée**.

**Goal :** médiathèque conforme (grille masonry, dropzone, panneau détails) ; **pipeline existant inchangé** (validation mime/taille/dimensions → webp + strip EXIF → MinIO).

**Architecture :** réécriture présentationnelle ; logique `lib/media/*` / `media-actions.ts` **inchangée**.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/media/page.tsx`, `lib/media/upload.ts`, `lib/media/video.ts`, `lib/media/ports.ts`, `lib/actions/media-actions.ts`, `media.test.ts`.
- Extraire : forme `MediaAsset` (url, dimensions, kind IMAGE/VIDEO/EMBED…), pipeline d'upload, garde-fous (mime/taille/dimensions).
- **Sortie :** ce que le panneau « détails » peut afficher + points d'entrée upload.

### Task 2 : Grille médiathèque + détails
**Files:** Modify `app/(dashboard)/media/page.tsx` · Create `components/media/*` (+ tests)
- Grille masonry ; sélection → panneau **détails** (dimensions, poids, format, « utilisé dans », EXIF strippées) ; support `VIDEO`/`EMBED`. Commit `feat(admin): media library v2 grid + details`.

### Task 3 : Dropzone d'upload
**Files:** Create `components/media/dropzone.tsx` (+ test)
- Zone de dépôt branchée sur l'action d'upload existante ; affiche le **pipeline** (webp + EXIF + MinIO) ; états (en cours, succès, erreur).
- **TDD** : déposer un fichier appelle l'action ; un type non autorisé affiche une erreur. Commit `feat(admin): media dropzone`.

### Task 4 : Barrière qualité + PR
- `media.test.ts` (existant) + nouveaux verts ; typecheck/lint. **Sécu :** garde-fous mime/taille intacts. Docs. PR « feat(admin): media v2 (P6) ».

## Definition of Done
- [ ] Médiathèque conforme + dropzone + détails. Pipeline & garde-fous inchangés. Tests verts. Docs + PR.
