# PROGRESS — Portfolio Yohan Debusscher

**Version courante : v0.2.0** (auth back office — voir `docs/patch_notes/patch_note_V0_2.md`).

## État courant
Infra Docker complète + **authentification back office livrée** (sessions opaques, MFA TOTP
obligatoire, anti brute-force). Tout reste **vert** : typecheck + build + lint + **22 tests Vitest**,
parcours auth vérifiés end-to-end. Pas encore de features de contenu (pages site / CRUD BO).

## Stack en place
- Monorepo **pnpm** workspaces : `apps/web` (public), `apps/admin` (back office),
  `packages/db` (Prisma), `packages/core` (types/utils partagés).
- **Next.js 16.2.9** (App Router, TS strict), **Tailwind v4**, React 19.2.
- **Prisma 7.8** (générateur `prisma-client` ESM + driver adapter `@prisma/adapter-pg`,
  config `prisma.config.ts`). Migration `init` appliquée.
- Outillage : ESLint 9 (flat), Prettier 3.9 (+ plugin Tailwind), TypeScript 5.9.
- Node 22 ciblé (CI/Docker), Node 24 en local.

## Modèle de données (schema.prisma)
- **Profile** (singleton, identité site) + `cvHtml` (CV HTML éditable au BO) + `cvPdfUrl` ; **SocialLink**.
- **Project** + **ProjectImage** + **Technology** (m2m).
- **Article** (news, tags `String[]`, statut DRAFT/PUBLISHED).
- **MediaAsset** (chaque webp converti, tracé ; référencé par avatar/cover/galerie).
- **Auth** : **AdminUser** (argon2id, TOTP, compteurs lockout), **Session** (token opaque hashé,
  `mfaPending`), **LoginAttempt** (audit). Tables `REVOKE`d pour `app_web` (isolation des secrets).
- Enums natifs : `ProjectStatus`, `ArticleStatus`.
- **CV** : pas de modèles structurés — le HTML premium est stocké tel quel en DB (éditable au BO).

## Authentification BO (livrée)
- Login argon2id → **MFA TOTP obligatoire** ; enrôlement par QR (secret persisté après preuve d'un code).
- Sessions opaques (cookie `httpOnly`/`SameSite`/`Secure`, 8 h) ; `proxy` = garde grossière,
  validation réelle côté serveur (`lib/auth/guards.ts`).
- Anti brute-force : lockout compte (5 échecs / 15 min) + rate-limit IP + audit `LoginAttempt`,
  erreurs génériques (anti-énumération), mitigation timing.
- Code : `packages/core/src/auth/*` (password/token/totp), `apps/admin/lib/auth/*`,
  pages `/login`, `/login/verify`, `/security/totp`. Seed admin : `db:seed`.

## Infra Docker (phasée)
- **Phase A livrée** : `docker-compose.yml` avec **db** (postgres:16, hôte 5436), **minio**
  (9100/9101), **umami** (3102) + base/rôle `umami` dédiés (init `datas/init/`). Réseaux
  `edge`/`internal`. Migration `init` appliquée. `.env`/`.env.example` à la racine.
  - Note dev : `db` est aussi sur `edge` pour publier 5436 (un réseau `internal` n'est pas
    routable depuis l'hôte) → en prod, retirer `edge` + port (override).
- **Phase B livrée** : service **`converter`** (`services/converter`, Node/Fastify/**sharp**,
  image→webp + strip EXIF + validation mime/taille/dimensions). Interne uniquement. Dockerfile
  multi-stage non-root (pnpm `deploy --legacy`). Vérifié end-to-end (200 image/webp).
- **Phase C livrée** : images **`web`/`admin`** (Next **standalone** monorepo, multi-stage non-root)
  + **proxy Caddy** (routage `web`/`admin`/`umami` par Host + `/media`→MinIO, en-têtes sécu).
  Sites en `http://` pilotés par env (dev) → domaines nus = HTTPS auto (prod). Vérifié : web/admin/stats `200`.
- **Phase D livrée (durcissement)** : bucket MinIO **`media`** (lecture publique, init one-shot `minio-init`)
  + **rôles DB moindre-privilège** (`app_web` lecture seule, `app_admin` RW ; `web`/`admin` câblés avec
    leur `DATABASE_URL` scopé). Vérifié : app_web INSERT refusé, /media/objet → 200.
- **Infra Docker complète & durcie** : 8 services. Reste : clé d'écriture MinIO scopée (vs root), durcissement prod (db hors edge).

## Ports (dev local, sans conflit OXO/KORTEKS)
- `web` 3100 · `admin` 3101 · (Docker) umami 3102 · minio 9100/9101 · proxy 8090 · db 5436.

## Décisions notables
- **Tout le contenu éditable passe par le BO** (principe produit, cf. CLAUDE.md).
- **Versions** : dernières, sauf TS/ESLint en 5/9 (testées par Next 16). Voir TASKS.
- Packages workspace en **source TS** (`transpilePackages`). Build scripts natifs : `allowBuilds` pnpm 11.

> Direction artistique : `.claude/rules/DESIGN_SYSTEM.md` (DA « éditorial sombre + or », pour le site — pas encore attaqué).

## Dernière livraison
- **Auth BO complète** (v0.2.0) : modèles d'auth + migrations, login + sessions, MFA TOTP,
  anti brute-force, 22 tests Vitest. Vérifiée verte, committée et poussée sur `dev`.

## Prochaines étapes
Voir `TASKS.md` — **features de contenu** : pages site public (`web`), CRUD BO, pipeline upload.
Hardening restant : clé MinIO scopée, prod (db hors edge), E2E Playwright, application de la DA.
