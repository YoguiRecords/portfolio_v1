# P7 — Web: SEO & AEO (metadata, JSON-LD, sitemap, robots, llms.txt) — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware (P-i18n).

**Goal:** Découvrabilité complète : `generateMetadata` par route, **JSON-LD** (Person, CreativeWork, Article, Event, FAQPage, BreadcrumbList), `sitemap.ts`, `robots.ts`, route **`/llms.txt`**, **hreflang** FR/EN, Open Graph/Twitter.

**Architecture:** Builders **purs** (`lib/seo/*`) testés unitairement, consommés par les pages (composition only). Métadonnées dérivées de `SiteSettings` (défauts) + champs SEO du contenu. JSON-LD injecté via un module `<JsonLd>`.

**Tech Stack:** Next.js 16 Metadata API, Prisma 7, Vitest, Playwright.

---

### Task 1: Builders JSON-LD (purs, TDD)

**Files:** `apps/web/lib/seo/jsonld.ts` (+ test).
**Test d'abord** : `personJsonLd(profile)` produit `@type:"Person"` avec `name`,
`jobTitle`, `sameAs` (socials) ; `articleJsonLd`, `creativeWorkJsonLd(project)`,
`faqPageJsonLd(faqs)`, `eventJsonLd`, `breadcrumbJsonLd`. Snapshots de structure.
**Commit** `feat(web): JSON-LD builders`.

---

### Task 2: Builders metadata (purs, TDD)

**Files:** `apps/web/lib/seo/metadata.ts` (+ test).
`buildMetadata({ title?, description?, ogImage?, settings, locale, path })` →
fallback sur défauts `SiteSettings`, **OpenGraph** + **Twitter**, **alternates
hreflang** (`fr`/`en`). Test : sans title → défaut ; hreflang présents. **Commit**
`feat(web): metadata builder with hreflang`.

---

### Task 3: `generateMetadata` par route

**Files:** Modify pages (`home`, `projets/[slug]`, `actus/[slug]`, `agenda/[slug]`).
Chaque page exporte `generateMetadata` utilisant les builders + `<JsonLd>` adapté
(Person sur home, CreativeWork sur projet, Article sur actu, Event sur agenda,
FAQPage si FAQ). **Commit** `feat(web): per-route metadata and JSON-LD`.

---

### Task 4: `sitemap.ts` + `robots.ts`

**Files:** `apps/web/app/sitemap.ts`, `apps/web/app/robots.ts` (+ tests des fonctions de génération).
- sitemap : home + projets/actus/événements **publiés**, **x2 locales** (hreflang).
  Test : un `DRAFT` est exclu.
- robots : `allow`/`disallow` depuis `SiteSettings.robotsExtra` + politique
  crawler IA (`allowAiCrawlers` → autoriser/bloquer GPTBot, ClaudeBot, etc.).
**Commit** `feat(web): sitemap and robots`.

---

### Task 5: Route `/llms.txt`

**Files:** `apps/web/app/llms.txt/route.ts` (+ test).
Sert `SiteSettings.llmsTxt` (présentation pour les moteurs IA), `text/plain`.
Fallback minimal généré depuis le profil si vide. **Commit** `feat(web): llms.txt route`.

---

### Task 6: E2E

`e2e/seo.spec.ts` : la home a un `<title>`, une meta description, un script
`application/ld+json` de type `Person` ; `/sitemap.xml` répond ; `/llms.txt`
répond en `text/plain`. **Commit** `test(e2e): seo metadata, sitemap, llms.txt`.

---

## Definition of Done (P7)
- Metadata + JSON-LD + OG/Twitter + hreflang sur toutes les routes publiques.
- sitemap (contenu publié, 2 locales) + robots (politique IA) + `/llms.txt`.
- Builders purs testés ; E2E vérifie les balises.
