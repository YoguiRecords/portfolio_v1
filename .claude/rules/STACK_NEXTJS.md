# STACK.md — Next.js / Monorepo / TypeScript

## Overview
- Monorepo pnpm workspaces | Next.js 16 (App Router) | TypeScript (strict) | Tailwind CSS v4
- Deux apps Next.js : `apps/web` (public, port 3100) et `apps/admin` (back office, port 3101)
- Ports dev choisis pour éviter les conflits avec d'autres stacks Docker locales (OXO occupe 3000/3001)

## Structure
```
apps/
  web/      # site public — SSR/SSG pour le SEO
    app/        # App Router (pages publiques)
    components/
  admin/    # back office — app client + Server Actions pour la DB
    app/
    components/
packages/
  db/       # Prisma : schema.prisma + client généré, exporté pour web & admin
  core/     # types & utils partagés (jamais de logique métier dans les composants)
```

## Conventions
- Composants fonctionnels uniquement, TypeScript strict.
- Accès DB **uniquement côté serveur** (Server Actions / Route Handlers) — jamais Prisma
  dans un composant client. Le navigateur ne touche jamais la DB.
- `admin` : composants `'use client'` pour l'UI, Server Actions pour lire/écrire.
- Pas de `fetch` direct dispersé : centraliser les appels dans des services/actions.
- Validation des entrées avec **Zod** à la frontière (Server Actions, Route Handlers).

## Upload & conversion d'images
- L'upload passe par `admin` (Server Action) : validation mime/taille/dimensions,
  puis appel HTTP **interne** au container `converter` (image → webp + strip EXIF),
  puis écriture dans MinIO, puis enregistrement de l'URL en DB.
- Voir `STACK_STORAGE.md` (MinIO) et `STACK_SECURITY.md` (pipeline d'upload).

## Analytics (Umami)
- Script de tracking Umami injecté dans `apps/web` (layout racine), pointant sur
  `stats.yohan-debusscher.com`. Cookieless → pas de bandeau cookies.

## Environnements & URLs (convention)
Les URLs sont **pilotées par l'environnement**, jamais en dur :
- **Dev** : liens **internes `localhost:<port>`** (web `http://localhost:3100`,
  admin `http://localhost:3101`, umami `http://localhost:3102`, minio `http://localhost:9100`).
- **Prod** : **URLs directes** (`https://yohan-debusscher.com`, `https://bo.yohan-debusscher.com`,
  `https://stats.yohan-debusscher.com`).
- Implémentation : variables d'env (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_ADMIN_URL`, etc.)
  définies par environnement (`.env` dev / secrets prod). Aucune URL codée en dur dans le code.

## Test coverage
- Cible 80 % services/stores. Composants : tester le comportement, pas l'implémentation.
- Voir `STACK_TESTING.md`.

## Coding norms
- TypeScript : `.claude/playbooks/lang-typescript.md`
- React : `.claude/playbooks/framework-react.md`
- Next.js : `.claude/playbooks/framework-nextjs.md`
- Tailwind : `.claude/playbooks/css-tailwind.md`
