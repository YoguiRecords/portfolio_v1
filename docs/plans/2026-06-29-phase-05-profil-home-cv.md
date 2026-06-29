# Phase 5 — Me concernant + Contenu home + CV — Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL `superpowers:executing-plans`. Phase 5 de la roadmap. Pré-requis : **P3 mergée** (réutilise `live-preview`).

**Goal :** « Me concernant » (identité, casquettes, bios, réseaux) avec **aperçu live de la section « À propos »** ; édition du contenu éditorial de la home (`HomeSection`) ; **éditeur CV HTML** rendu de façon **isolée** (iframe `srcdoc` + CSP).

**Architecture :** réécriture présentationnelle ; logique `profile.ts` / `home-section.ts` **inchangée** ; sécurité CV : rendu isolé (cf. `STACK_SECURITY` §5).

---

### Task 1 : Analyser le code précédemment développé
- Lire : `app/(dashboard)/profile/{page,profile-form}.tsx`, `app/(dashboard)/profile/profile-form.test.tsx`, `lib/content/profile.ts`, `app/(dashboard)/content/page.tsx`, `lib/content/home-section.ts`.
- Extraire : champs `Profile` (fullName, headline, bio, typewriterLines, socials, cvHtml…), gestion `SocialLink`, structure `HomeSection`.
- **Sortie :** mapping champs ↔ section publique « À propos » + où vit `cvHtml`.

### Task 2 : Form « Me concernant » + aperçu live
**Files:** Modify `app/(dashboard)/profile/profile-form.tsx` (+ adapter le test existant) · Create `components/profile/about-preview.tsx`
- Form (identité, accroche, casquettes/pills, bio courte, à-propos, réseaux, avatar) ; `about-preview` (hero + parcours) consommant le state via `live-preview`.
- **TDD** : taper « titre/accroche » met à jour l'aperçu ; `profile-form.test.tsx` adapté reste vert. Commit `feat(admin): about editor v2 with live preview`.

### Task 3 : Édition des sections home
**Files:** Modify `app/(dashboard)/content/page.tsx` (+ test)
- Liste éditable des `HomeSection` (eyebrow/titre/intro/CTA/ordre/visibilité), réordonnable, toggle visibilité. Commit `feat(admin): home sections editor v2`.

### Task 4 : Éditeur CV HTML (rendu isolé)
**Files:** Create `app/(dashboard)/cv/page.tsx` + `components/cv/cv-editor.tsx` (+ test)
- Édition `Profile.cvHtml` ; **aperçu via `<iframe srcdoc=… sandbox csp>`** (pas d'injection dans le DOM admin). TDD : l'aperçu utilise bien un `iframe` sandboxé. Commit `feat(admin): isolated CV HTML editor`.

### Task 5 : Barrière qualité + PR
- Tests verts (dont `profile-form.test.tsx`) ; typecheck/lint. **Sécu :** vérifier l'isolation du CV. Docs (`SECURITY.md` si la posture change). PR « feat(admin): profile/home/cv v2 (P5) ».

## Definition of Done
- [ ] « Me concernant » alimente la section « À propos » + aperçu live.
- [ ] Sections home éditables. CV HTML **isolé** (iframe srcdoc + CSP). Tests verts. Docs + PR.
