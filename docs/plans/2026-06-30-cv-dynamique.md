# CV dynamique — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Faire du CV un contenu dynamique éditable au BO, projeté sur 3 surfaces
(home, page `/cv` riche, PDF A4 figé), bilingue FR/EN, avec génération PDF automatisée
via un conteneur headless durci.

**Architecture:** Source unique de vérité (corpus portfolio en DB) → 3 projections via
drapeaux d'inclusion par surface. Le PDF = composant `CvDocument` (port fidèle du HTML
A4), rendu sur une route interne admin, imprimé par un service Docker `cv-renderer`
(Chromium headless, Inter self-hosté), stocké en MinIO, servi figé. Design de référence :
`docs/plans/2026-06-30-cv-dynamique-design.md`.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 / PostgreSQL 16, TypeScript strict,
Zod, Tailwind v4, `@dnd-kit/core` + `@dnd-kit/sortable`, Playwright (E2E + génération PDF),
Vitest, Docker.

**Découpage : 6 PRs atomiques `llm → dev`** (chacune verte avant merge). Ce document
détaille **PR1 en tâches TDD bite-sized**. PR2–6 sont décrites en tâches actionnables ;
leur code exact sera étoffé **juste avant exécution** (elles dépendent de l'état réel
après merge des PRs précédentes — éviter du code spéculatif).

**Convention de commit :** Conventional Commits, scope `db`/`admin`/`web`/`core`/`docker`/`docs`.
**Rappel Git :** l'IA ne travaille que sur `llm`, une PR `llm → dev` par PR du plan.

---

## PR1 — Modèle de données (fondation, additif, site intact)

**Objectif :** étendre `Profile`/`Skill`/`Project`/`Kpi`, créer
`Experience`/`Education`/`Language`/`Interest`/`CvExport`, migration, seed, client régénéré.
Aucune UI. Le site continue de fonctionner (champs additifs, valeurs par défaut).

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create (migration): `packages/db/prisma/migrations/<ts>_cv_dynamic_model/migration.sql` (généré)
- Modify: `packages/db/prisma/seed-content.ts`
- Modify: `packages/db/src/testing/factories.ts`
- Test: `packages/db/src/testing/cv-model.test.ts` (nouveau)

### Task 1.1 : Enums + extensions de modèles existants

**Step 1 — Ajouter les enums** dans `schema.prisma` (près des autres `enum`, ~ligne 18+) :

```prisma
enum SkillKind {
  TECH
  SOFT
}

enum ProjectCvBadge {
  NONE
  KEY
  IN_PROGRESS
}

enum ExperienceTier {
  FEATURED
  PREVIOUS
  MINI
}

enum ExperienceBadge {
  NONE
  PERSO
  EN_COURS
  CLE
}
```

**Step 2 — Étendre `Profile`** (ajouter sous `aiSummary`) :

```prisma
  // CV (champs spécifiques au document CV / page /cv)
  cvAccroche        String? // accroche éditoriale du CV
  cvAvailabilityStart String? // « Prise de poste » (ex. « Immédiate »)
  cvMobility        String? // « Mobilité » (ex. « Hauts-de-France · remote »)
  cvContractType    String? // « Contrat » (ex. « CDI · freelance »)
```

> `cvPdfUrl`/`cvHtml` existants restent (back-compat) ; `CvExport` devient la source du
> PDF servi. Suppression de `cvPdfUrl` planifiée hors périmètre (cleanup ultérieur).

**Step 3 — Étendre `Skill`** :

```prisma
  kind      SkillKind @default(TECH)
  showOnCv  Boolean   @default(false)
```
(`category` existe déjà — réutilisé pour les 5 catégories TECH.)

**Step 4 — Étendre `Project`** (sous `order`) :

```prisma
  showOnCv Boolean        @default(false)
  cvBadge  ProjectCvBadge @default(NONE)
```

**Step 5 — Étendre `Kpi`** :

```prisma
  showOnCv Boolean @default(false)
```

### Task 1.2 : Nouvelles entités CV

**Step 1 — Ajouter les modèles** (section « Identité / CV ») :

```prisma
/// Expérience professionnelle (corpus CV). Projetée sur PDF (condensé),
/// page /cv (détaillé) et éventuellement la home, selon les drapeaux.
model Experience {
  id          String          @id @default(cuid())
  title       String
  company     String
  location    String?
  startDate   DateTime
  endDate     DateTime? // null = poste en cours
  tier        ExperienceTier  @default(MINI)
  badge       ExperienceBadge @default(NONE)
  stack       String[] // tags techno (CV)
  bullets     String[] // puces de réalisations (CV condensé)
  description String? // texte long — page /cv uniquement
  order       Int             @default(0)
  showOnPdf    Boolean        @default(false)
  showOnCvPage Boolean        @default(true)
  showOnSite   Boolean        @default(false)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([order])
  @@index([startDate])
}

/// Formation (chapitre « Formations » du CV).
model Education {
  id           String   @id @default(cuid())
  title        String
  institution  String?
  date         String // libellé (« 2018 — 2020 »)
  details      String[] // sous-lignes
  order        Int      @default(0)
  showOnPdf    Boolean  @default(true)
  showOnCvPage Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([order])
}

/// Langue (sidebar CV).
model Language {
  id        String   @id @default(cuid())
  name      String // « Français »
  level     String // « Langue maternelle », « C1 »
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}

/// Centre d'intérêt (sidebar CV).
model Interest {
  id        String   @id @default(cuid())
  label     String
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([order])
}

/// PDF du CV généré par le BO, une ligne par langue (upsert). Servi figé au public.
model CvExport {
  id          String   @id @default(cuid())
  locale      String   @unique // « fr » | « en »
  url         String // URL MinIO publique
  sizeBytes   Int
  generatedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

> i18n : pas de champ de traduction dans ces modèles — l'overlay générique
> `Translation { model, recordId, field, locale, value }` couvre les champs texte
> (comme pour `Profile`/`HomeSection`). Aucune modification de `Translation`.

### Task 1.3 : Migration

**Step 1 — Générer la migration :**
Run: `pnpm --filter @portfolio/db exec prisma migrate dev --name cv_dynamic_model`
Expected: nouvelle migration créée + appliquée, client régénéré, **aucune perte**
(tout est additif / nullable / avec défaut).

**Step 2 — Vérifier le client :**
Run: `pnpm --filter @portfolio/db build` (= `prisma generate`)
Expected: succès, types `Experience`, `Education`, `Language`, `Interest`, `CvExport` exportés.

### Task 1.4 : Factories de test

**Step 1 — Ajouter les factories** dans `packages/db/src/testing/factories.ts` (suivre
le style des factories existantes) : `makeExperience`, `makeEducation`, `makeLanguage`,
`makeInterest` (objets `Prisma.*CreateInput` avec valeurs par défaut surchargeables).

### Task 1.5 : Test de modèle (TDD)

**Step 1 — Écrire le test qui échoue** `packages/db/src/testing/cv-model.test.ts` :

```ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../index";

describe("CV model", () => {
  afterAll(async () => {
    await prisma.experience.deleteMany();
    await prisma.$disconnect();
  });

  it("crée et relit une Experience avec ses drapeaux par surface", async () => {
    // Arrange + Act
    const exp = await prisma.experience.create({
      data: {
        title: "Lead technique",
        company: "Acme",
        startDate: new Date("2023-01-01"),
        tier: "FEATURED",
        stack: ["TypeScript", "Next.js"],
        bullets: ["Livraison X", "Management Y"],
        showOnPdf: true,
      },
    });
    // Assert
    expect(exp.tier).toBe("FEATURED");
    expect(exp.showOnPdf).toBe(true);
    expect(exp.showOnCvPage).toBe(true); // défaut
    expect(exp.bullets).toEqual(["Livraison X", "Management Y"]);
  });
});
```

**Step 2 — Lancer (doit échouer si le client n'est pas régénéré) :**
Run: `pnpm --filter @portfolio/db test cv-model`
Expected (avant migration/generate) : FAIL (`prisma.experience` undefined).

**Step 3 — Faire passer :** la migration + generate (Tasks 1.3) rendent le test vert.
Run: `pnpm --filter @portfolio/db test cv-model`
Expected: PASS.

### Task 1.6 : Seed minimal

**Step 1 — Étendre `seed-content.ts`** : créer quelques `Experience` (1 FEATURED, 1 PREVIOUS,
1 MINI), 2 `Education`, 2 `Language`, 3 `Interest` ; marquer 2-3 `Skill` `kind=SOFT`, poser
`category` sur les TECH, `showOnCv=true` sur quelques `Skill`/`Project`/`Kpi`. (Le contenu
réel et exhaustif sera saisi via le BO en PR2 ; ici juste de quoi rendre `/cv` non vide.)

**Step 2 — Rejouer le seed :**
Run (depuis l'hôte, DATABASE_URL réécrit `db:5432`→`localhost:5436`) :
`pnpm --filter @portfolio/db exec tsx prisma/seed-content.ts`
Expected: ligne récap avec `experiences:3 educations:2 …`.

### Task 1.7 : Commit + PR

```bash
git add packages/db
git commit -m "feat(db): CV dynamic data model (experiences, education, languages, interests, CvExport)"
git push origin llm
# Ouvrir PR llm → dev ; merger si CI verte (règle de merge projet)
```

---

## PR2 — CRUD au BO + i18n + drag-reorder

**Objectif :** écrans BO pour saisir tout le corpus CV, bilingue, réordonnables.

**Dépendance :** ajouter `@dnd-kit/sortable` (`pnpm --filter admin add @dnd-kit/sortable`).

**Tâches (à étoffer en code juste avant exécution) :**
1. **Zod** dans `packages/core/src/admin/content-schemas.ts` : `ExperienceInput`,
   `EducationInput`, `LanguageInput`, `InterestInput` ; étendre `ProfileInput`
   (+champs CV), `SkillInput` (+kind/category/showOnCv), `ProjectInput` (+showOnCv/cvBadge),
   `KpiInput` (+showOnCv). Tests Zod (rejet d'entrées invalides) — TDD.
2. **Server Actions** `apps/admin/lib/actions/*` : upsert/delete par entité, validées Zod,
   `revalidatePath('/cv')`, suppressions via `ConfirmSubmitButton`. Tests (mocks).
3. **Écrans BO** (réutiliser kit UI + `PageContainer` + `LocalizedField` + `on-save-translate`) :
   - `app/(dashboard)/experiences/` (liste + éditeur, drag-reorder bullets/stack/items via
     `@dnd-kit/sortable`),
   - `app/(dashboard)/formations/`, `app/(dashboard)/langues/`, `app/(dashboard)/interets/`,
   - étendre écrans existants : compétences (kind/category/showOnCv), projets (showOnCv/cvBadge),
     KPI (showOnCv), profil (champs CV).
4. **Nav** : entrées dans `admin-nav`.
5. **i18n** : champs traduisibles via `LocalizedField` (FR/EN).
6. **Composant réordonnable réutilisable** : `components/ui/sortable-list.tsx` (DRY) + test.
7. Commit + PR `llm → dev`.

---

## PR3 — `CvDocument` (rendu A4 fidèle) + route interne

**Objectif :** porter le HTML A4 en composant React data-driven, Inter self-hosté, exposé
sur une route interne admin imprimable.

**Tâches :**
1. **Self-host Inter** : ajouter les fichiers de police (woff2, poids 300→900) dans
   `apps/admin` (et `apps/web` pour la page /cv), déclarer en `@font-face` local
   (supprimer l'`@import` Google Fonts). Vérifier RGPD (aucun appel CDN).
2. **`CvDocument`** : `apps/admin/components/cv/cv-document.tsx` + CSS = reproduction fidèle
   du HTML (`CV_Debusscher_Visuel.html`) ; props = données projetées (`showOnPdf`).
   Sous-composants : sidebar (identité/contact/compétences/langues/soft skills/intérêts/dispo),
   main (accroche/expériences[featured|previous|mini]/formations/réalisations/stats/footer).
3. **Loader CV** : `apps/admin/lib/data/cv-document.ts` (sélection `showOnPdf`, locale).
4. **Route interne** : `apps/admin/app/internal/cv-document/route` (ou page) `?locale=fr|en`,
   **garde** (token/header interne), **non routée par Caddy** (vérifier `STACK_PROXY`).
5. **Tests** : unit (projection `showOnPdf`), rendu (RTL : présence des sections),
   validation navigateur réel (route interne en dev).
6. Commit + PR.

---

## PR4 — Service `cv-renderer` + génération PDF

**Objectif :** conteneur headless durci qui imprime `CvDocument` → MinIO → `CvExport`.

**Tâches :**
1. **Service** `services/cv-renderer/` : petit serveur HTTP (Node + Playwright), endpoint
   interne `POST /render {locale}` → octets PDF (`page.pdf({ printBackground:true,
   preferCSSPageSize:true })`). **Inter installé** dans l'image.
2. **Dockerfile** durci : multi-stage, non-root, FS read-only, image minimale,
   **aucun port publié**, réseau `internal`, **sans Internet**.
3. **docker-compose.yml** : ajouter `cv-renderer` (réseau interne), variable d'URL côté `admin`.
4. **Server Action** `generateCvPdfAction` (admin authentifiée, CSRF) : appelle `cv-renderer`
   pour `fr` puis `en`, upload MinIO (nom randomisé), upsert `CvExport`. Validation Zod.
5. **Panneau BO** : bouton « Générer le PDF », « dernier généré le… » par langue, aperçu.
6. **CI** : ajouter `cv-renderer` au job `docker` (build/push image).
7. **Tests** : unit (action mockée), **fidélité PDF** (diff vs PDF de référence imprimé main),
   FR + EN.
8. Commit + PR.

---

## PR5 — Page `/cv` publique riche (tue le 404)

**Objectif :** page publique bilingue, riche, qui réutilise la DA home + nouveaux composants,
avec téléchargement des PDF figés.

**Tâches :**
1. **Loader** `apps/web/lib/data/cv.ts` : corpus filtré `showOnCvPage`, `CvExport` (URLs PDF),
   overlay EN, `cache()`.
2. **Page** `apps/web/app/[locale]/cv/page.tsx` (`force-dynamic`, metadata SEO) : sections
   web-native (DA home réutilisée + nouveaux composants), boutons « Télécharger le PDF »
   (FR/EN selon disponibilité), aperçu optionnel du document A4.
3. **Lien hero** déjà présent → vérifier la localisation du `href`.
4. **Tests** : unit (loader), E2E (rendu FR/EN, download), **navigateur réel MCP**
   desktop + mobile FR + EN, screenshots, UX.
5. Commit + PR.

---

## PR6 — Documentation (clôture)

**Tâches :** mettre à jour `docs/technical/ARCHITECTURE.md` (service `cv-renderer`, flux PDF,
route interne), `docs/technical/SECURITY.md` (isolation renderer, route interne, génération),
`docs/technical/API_REFERENCE.md` (Server Actions CV + génération), `docs/patch_notes/…`,
`PROGRESS.md`, `TASKS.md`. Commit + PR.

---

## Rappels transverses
- **TDD** : test rouge → impl minimale → vert → commit, à chaque tâche.
- **DRY/YAGNI/KISS** : réutiliser kit UI, LocalizedField, overlay Translation, composant
  sortable mutualisé ; pas d'historique PDF, pas de génération à la volée.
- **Validation navigateur réel (NON-NÉGOCIABLE)** avant de dire « terminé » sur toute UI.
- **Sécurité** : entrées Zod, renderer isolé, route interne non exposée, secrets hors images.
