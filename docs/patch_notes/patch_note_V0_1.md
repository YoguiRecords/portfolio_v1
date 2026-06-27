# Patch notes — v0.1.x

## v0.1.0 — Infrastructure (2026-06-27)

Premier jalon : socle technique complet et vérifié. Aucune fonctionnalité applicative.

### Monorepo & outillage
- Monorepo pnpm (`apps/*`, `packages/*`, `services/*`).
- `apps/web` (site public) et `apps/admin` (back office) en **Next.js 16** (App Router, TypeScript strict, Tailwind v4).
- `packages/db` (**Prisma 7**, driver adapter `@prisma/adapter-pg`), `packages/core` (types/utils partagés).
- ESLint 9 (flat), Prettier 3.9, TypeScript 5.9. CI (lint/typecheck/test/build), CodeQL, Dependabot.

### Base de données
- Schéma métier Prisma : `Profile` (+ `cvHtml`), `SocialLink`, `Project`, `ProjectImage`, `Technology`,
  `Article`, `MediaAsset` ; enums `ProjectStatus`, `ArticleStatus`.
- Migration `init` appliquée.
- Rôles à moindre privilège : `app_web` (lecture seule), `app_admin` (lecture/écriture).

### Infrastructure Docker (8 services)
- `db` (PostgreSQL 16), `minio` (+ bucket public `media`), `umami` (analytics, base/rôle dédiés),
  `converter` (image → webp, Node/Fastify/sharp), `web`, `admin` (images standalone non-root),
  `proxy` (Caddy : routage par sous-domaine + `/media`, en-têtes de sécurité, HTTPS auto en prod).
- Réseaux `edge` (publiable) / `internal` (sans accès Internet).

### Sécurité
- Isolation réseau (seul le proxy exposé), moindre privilège DB, secrets hors repo (`.env` git-ignoré),
  conteneurs non-root, bucket média en lecture publique uniquement.
