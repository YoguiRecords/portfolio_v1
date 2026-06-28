# P4 — Web: News & Agenda — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: superpowers:executing-plans. Standards : `2026-06-28-CODE-STANDARDS.md`. Locale-aware (P-i18n).

**Goal:** Pages publiques **News** (`/actus`, `/actus/[slug]`) et **Agenda** (`/agenda`, `/agenda/[slug]`) rendues depuis la DB, avec galerie média (images & vidéos), markdown sûr, et publication programmée respectée.

**Architecture:** Server Components + loaders locale-aware (`localize()`). Markdown rendu via un module `Markdown` sûr (sanitize). Médias via module `Gallery` (image/vidéo/embed selon `MediaKind`). Un Route Handler **protégé** bascule les contenus programmés échus (logique pure de P1). Tout modulaire (1 composant + 1 CSS Module).

**Tech Stack:** Next.js 16 RSC, Prisma 7, next-intl, un renderer markdown sûr, Vitest+RTL, Playwright.

---

### Task 1: Loaders News & Agenda

**Files:** Create `apps/web/lib/data/news.ts`, `apps/web/lib/data/agenda.ts` + tests.

- `listArticles(prisma, locale)` → `status: "PUBLISHED"` ordonnés par `publishedAt desc`, overlay locale.
- `getArticleBySlug` → 404 si non publié ; include `media` (ordonné), `event`, `faqs`.
- `listEvents(prisma, locale)` → `status:"PUBLISHED"`, `visibility:"PUBLIC"`, `startAt asc` (futurs en avant).
- `getEventBySlug`.
**Test d'abord** (DB de test) : une actu `SCHEDULED` n'apparaît pas dans `listArticles`. **Commit** `feat(web): news & agenda loaders`.

---

### Task 2: Module `Markdown` sûr

**Files:** Create `apps/web/components/markdown/*` (+ `.module.css` + `.test.tsx`)

**Test d'abord** : le markdown `**gras**` rend `<strong>`, et `<script>` injecté est **neutralisé** (pas d'HTML brut non assaini — cf. STACK_SECURITY). Implémenter avec un renderer markdown + sanitize. **Commit** `feat(web): safe markdown module`.

---

### Task 3: Module `Gallery` (image/vidéo/embed)

**Files:** Create `apps/web/components/gallery/*`

**Test d'abord** : un média `IMAGE` rend `<img alt>`, un `VIDEO` rend `<video>`, un `EMBED` rend l'iframe du `externalUrl`. Lazy-loading, ratios fixes (CLS), a11y. **Commit** `feat(web): media gallery module`.

---

### Task 4: Pages News (liste + détail)

**Files:** Create `apps/web/app/[locale]/actus/page.tsx`, `…/actus/[slug]/page.tsx`, modules `article-card`, `article-header`.

Pages = **composition only** : loader + composition (`ArticleCard` liste ; détail = `ArticleHeader` + `Markdown` + `Gallery` + lien évènement). `generateMetadata` (P7). **Commit** `feat(web): news list and article page`.

---

### Task 5: Pages Agenda (liste + détail)

**Files:** `apps/web/app/[locale]/agenda/page.tsx`, `…/agenda/[slug]/page.tsx`, modules `event-card`, `event-details`.

`EventCard` (date/heure/lieu, badge PUBLIC) ; détail = `EventDetails` (date/heure,
lieu/online, **bouton « S'inscire » → `registrationUrl` externe** `rel="noopener"`,
+ `Markdown` + `Gallery`). **Commit** `feat(web): agenda list and event page`.

---

### Task 6: Bascule des contenus programmés

**Files:** Create `apps/web/app/api/cron/publish/route.ts`, Test `…/route.test.ts`

- Route **protégée par un secret** (`process.env.CRON_SECRET`, en `.env`),
  appelée par un cron externe (ou `vercel cron`/`docker` job). Utilise
  `splitDue` (P1) : passe `SCHEDULED && scheduledAt<=now` → `PUBLISHED` +
  `publishedAt=now`, pour `Article` **et** `Event`, puis `revalidate` les routes.
- **Écriture** : cette route tourne côté serveur avec un rôle autorisé à écrire
  (⚠️ `app_web` est lecture seule). → utiliser un client dédié `app_admin` côté
  serveur **uniquement pour ce job** (secret), ou déléguer à un endpoint `admin`.
  Décision : endpoint **dans `admin`** (`app_admin`) appelé par le cron, pas dans `web`.
  → Déplacer la route en `apps/admin/app/api/cron/publish/route.ts`.
**Test** : 1 actu échue passe `PUBLISHED`, 1 future reste `SCHEDULED`. **Commit**
`feat(admin): scheduled-publish cron endpoint`.

---

### Task 7: E2E News & Agenda

**Files:** `e2e/news.spec.ts`, `e2e/agenda.spec.ts` — la liste affiche le contenu
seedé ; le détail affiche le markdown ; l'agenda montre le bouton d'inscription.
**Commit** `test(e2e): news and agenda pages`.

---

## Definition of Done (P4)
- News + Agenda rendues depuis la DB, locale-aware, markdown sûr, galerie
  image/vidéo/embed, modules réutilisables.
- Contenus programmés masqués tant que non échus ; cron de bascule testé (`admin`).
- Lien d'inscription externe sécurisé (`rel="noopener noreferrer"`).
