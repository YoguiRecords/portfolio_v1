# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Bootstrap monorepo
- [ ] Initialiser le monorepo pnpm (workspaces : `apps/*`, `packages/*`).
- [ ] Scaffolder `apps/web` (Next.js 15, TS strict, Tailwind v4).
- [ ] Scaffolder `apps/admin` (Next.js 15, TS strict, Tailwind v4).
- [ ] Créer `packages/db` (Prisma) + `packages/core` (types/utils).

## Infrastructure Docker
- [ ] `docker-compose.yml` : 7 services + réseaux `edge` / `internal`.
- [ ] Dockerfiles multi-stage non-root (web, admin, converter).
- [ ] Caddyfile : routage 3 sous-domaines + `/media`, HTTPS auto, en-têtes sécu.
- [ ] Container `converter` (image → webp + strip EXIF).
- [ ] MinIO : bucket `media` public en lecture, credentials écriture serveur.
- [ ] Umami : service + base `umami` + rôle dédié.

## Base de données
- [ ] Schéma Prisma : CV, projets, abonnés newsletter.
- [ ] Rôles Postgres séparés (`web` lecture seule, `admin` RW, `umami`).

## Fonctionnalités
- [ ] Site public : pages CV, projets, inscription newsletter.
- [ ] Back office : auth durcie (MFA, rate-limit), CRUD contenu, upload images.
- [ ] Pipeline upload sécurisé (validation Zod + converter + MinIO).
- [ ] Newsletter : double opt-in + envoi.

## Transverse
- [ ] Tests (Vitest + Playwright) sur les parcours critiques.
- [ ] Docs `docs/technical/` (ARCHITECTURE, SECURITY, API_REFERENCE).
