# Phase 7 — Témoignages (modération) — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 7 de la roadmap. Pré-requis : **P1 mergée**.

**Goal :** file de modération conforme — PENDING/APPROVED/REJECTED, champs auteur enrichis, édition du texte affiché vs original, mise en avant, ordre. Préparer le **lien CRM** (un auteur peut devenir un contact, branché en P11).

**Architecture :** réécriture présentationnelle ; logique `moderation.ts` / `moderation-actions.ts` **inchangée**. Rappel sécu : `submittedContent` immuable (audit), `content` éditable ; `app_web` ne lit ni email/ip/texte original ni ne définit `status`.

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/temoignages/page.tsx`, `lib/content/moderation.ts`, `lib/actions/moderation-actions.ts`, `moderation.test.ts`, modèle `Testimonial` (schema).
- Extraire : actions approve/edit/reject, champs auteur (`authorName/Role/Company/Relationship`), invariants (audit `submittedContent`).
- **Sortie :** mapping statuts ↔ actions + ce qui est éditable.

### Task 2 : File de modération conforme
**Files:** Modify `app/(dashboard)/temoignages/page.tsx` (+ test du composant)
- Onglets statut (`Segmented`) ; carte témoignage (auteur + rôle + société + relation, note, date) ; affichage **texte original vs affiché** ; actions **Approuver / Éditer / Refuser** (confirmation pour refus). Commit `feat(admin): testimonials moderation v2`.

### Task 3 : Édition + mise en avant + ordre
**Files:** Modify le composant (+ test)
- Éditer `content` (sans toucher `submittedContent`) ; toggle `isFeatured` ; réordonner. **TDD** : éditer le texte affiché n'altère pas l'original (action mockée vérifiée). Commit `feat(admin): testimonial edit/feature/order`.

### Task 4 : Préparer le lien CRM
**Files:** Modify le composant
- Bouton « Créer un contact à partir de l'auteur » → **stub** désactivé tant que le CRM n'existe pas (activé en P11). Commit `chore(admin): testimonial → CRM hook stub`.

### Task 5 : Barrière qualité + PR
- `moderation.test.ts` (existant) + nouveaux verts ; typecheck/lint. **Sécu :** invariants d'audit respectés. Docs. PR « feat(admin): testimonials v2 (P7) ».

## Definition of Done
- [ ] Modération conforme (approuver/éditer/refuser), audit préservé, mise en avant/ordre. Hook CRM en stub. Tests verts. Docs + PR.
