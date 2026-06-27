# STACK.md — PostgreSQL / Prisma

## Overview
- PostgreSQL 16 | container `db` | **jamais exposé** sur l'hôte en prod (réseau interne)
- ORM : **Prisma** (schéma typé + migrations versionnées)

## Bases & rôles (moindre privilège)
Un seul container Postgres, **deux bases logiques + rôles séparés** :
- Base `portfolio` :
  - rôle `web` → **lecture seule** sur le contenu public (si le site public est compromis,
    impossible d'écrire ou de tout lire).
  - rôle `admin` → lecture/écriture, cantonné à ce qu'il gère.
- Base `umami` : rôle `umami` dédié, ne voit **que** ses propres tables.

## Schéma & migrations
- Source de vérité : `packages/db/prisma/schema.prisma`.
- Migrations : `prisma migrate` (versionnées, rejouables). En prod : `prisma migrate deploy`.
- Toujours des requêtes paramétrées (Prisma le fait nativement) → pas d'injection SQL.

## Conventions
- PK : `id` (uuid ou cuid). Timestamps : `createdAt` / `updatedAt`.
- Booléens : préfixe `is*` / `has*`. Index/contraintes nommés explicitement.

## Sécurité
- Credentials via secrets / `.env` git-ignoré — jamais en dur, jamais dans l'image.
- Port DB non publié en prod ; accès réservé à `web`/`admin`/`umami` par le réseau interne.

## Coding norms
- `.claude/playbooks/tech-postgresql.md`

## Forbidden paths
- `.env` (secrets, ne pas lire)
