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
- **Infra Docker complète** : 7 services up. Reste : créer le bucket MinIO `media`, durcissement prod, rôles DB.

## Ports (dev local, sans conflit OXO/KORTEKS)
- `web` 3100 · `admin` 3101 · (Docker) umami 3102 · minio 9100/9101 · proxy 8090 · db 5436.

## Décisions notables
- **Tout le contenu éditable passe par le BO** (principe produit, cf. CLAUDE.md).
- **Versions** : dernières, sauf TS/ESLint en 5/9 (testées par Next 16). Voir TASKS.
- Packages workspace en **source TS** (`transpilePackages`). Build scripts natifs : `allowBuilds` pnpm 11.

> Direction artistique : `.claude/rules/DESIGN_SYSTEM.md` (DA « éditorial sombre + or », pour le site — pas encore attaqué).

## Dernière livraison
- Infra Docker Phase C (images web/admin + proxy Caddy) vérifiée verte (branche `feature/docker-apps-proxy` → `dev`).

## Prochaines étapes
Voir `TASKS.md` — bucket MinIO `media`, rôles DB moindre-privilège, auth BO, puis features (pages + CRUD).
