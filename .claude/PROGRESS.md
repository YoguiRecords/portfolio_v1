# PROGRESS — Portfolio Yohan Debusscher

## État courant
Monorepo bootstrappé + **schéma Prisma métier livré et migré** (`init`). Tout reste **vert**
(typecheck + build). Pas encore d'infra Docker complète ni de features applicatives.

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
- Enums natifs : `ProjectStatus`, `ArticleStatus`.
- **CV** : pas de modèles structurés (Experience/Education/Skill retirés) — le HTML premium est conservé
  tel quel et stocké en DB (approche éditable au BO).

## Base de dev
- Container ad-hoc **`portfolio-dev-db`** (postgres:16, hôte **5436**, db/role `portfolio`).
  À formaliser dans `docker-compose.yml` (tâche infra). `.env` (git-ignoré) dans `packages/db`.

## Ports (dev local, sans conflit OXO/KORTEKS)
- `web` 3100 · `admin` 3101 · (Docker) umami 3102 · minio 9100/9101 · proxy 8090 · db 5436.

## Décisions notables
- **Tout le contenu éditable passe par le BO** (principe produit, cf. CLAUDE.md).
- **Versions** : dernières, sauf TS/ESLint en 5/9 (testées par Next 16). Voir TASKS.
- Packages workspace en **source TS** (`transpilePackages`). Build scripts natifs : `allowBuilds` pnpm 11.

> Direction artistique : `.claude/rules/DESIGN_SYSTEM.md` (DA « éditorial sombre + or », pour le site — pas encore attaqué).

## Dernière livraison
- Schéma Prisma métier + migration `init` (branche `feature/prisma-schema` → `dev`).

## Prochaines étapes
Voir `TASKS.md` — priorité : **infra Docker** (compose + Caddy + MinIO + converter + Umami), puis features.
