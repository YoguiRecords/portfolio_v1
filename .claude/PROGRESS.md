# PROGRESS — Portfolio Yohan Debusscher

## État courant
Monorepo bootstrappé et **vérifié vert** (typecheck + lint + build sur tout le workspace).
Pas encore de schéma métier, d'infra Docker, ni de features applicatives.

## Stack en place
- Monorepo **pnpm** workspaces : `apps/web` (public), `apps/admin` (back office),
  `packages/db` (Prisma), `packages/core` (types/utils partagés).
- **Next.js 16.2.9** (App Router, TS strict), **Tailwind v4**, React 19.2.
- **Prisma 7.8** (générateur `prisma-client` ESM + driver adapter `@prisma/adapter-pg`,
  config dans `prisma.config.ts`, modèle placeholder `HealthCheck`).
- Outillage : ESLint 9 (flat), Prettier 3.9 (+ plugin Tailwind), TypeScript 5.9.
- Node 22 ciblé (CI/Docker), Node 24 en local.

## Ports (dev local, sans conflit avec OXO/KORTEKS)
- `web` 3100 · `admin` 3101 · (Docker ultérieur) umami 3102 · minio 9100/9101 · proxy 8090.
- Postgres : interne (non publié).

## Décisions notables
- **Versions** : tout à la dernière, sauf TS et ESLint laissés en 5/9 (versions testées par Next 16) ;
  TS 6 / ESLint 10 dispo mais non adoptés (risque bleeding-edge) — voir TASKS.
- Packages workspace exposés en **source TS** (`transpilePackages` côté apps).
- Build scripts natifs approuvés explicitement (`allowBuilds` pnpm 11).

## Dernière livraison
- Bootstrap monorepo (apps + packages, install, generate, typecheck/lint/build verts).
  Branche `feature/monorepo-bootstrap` → `dev`.

## Prochaines étapes
Voir `TASKS.md` — priorité : schéma Prisma métier, puis infra Docker (compose + Caddy + MinIO + converter + Umami).
