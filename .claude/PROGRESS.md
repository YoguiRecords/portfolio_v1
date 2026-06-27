# PROGRESS — Portfolio Yohan Debusscher

## État courant
Projet initialisé. Configuration `.claude/` mise en place (réutilisée et adaptée depuis KORTEKS).
**Aucun code applicatif n'a encore été écrit.**

## Stack décidée
- Monorepo pnpm : `apps/web` (public) + `apps/admin` (back office), `packages/db` (Prisma) + `packages/core`.
- Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4.
- PostgreSQL 16 + Prisma (bases `portfolio` + `umami`, rôles séparés).
- Docker (7 services) derrière Caddy : `proxy`, `web`, `admin`, `converter` (webp), `minio`, `db`, `umami`.
- Domaines : `yohan-debusscher.com` / `bo.yohan-debusscher.com` / `stats.yohan-debusscher.com`.

## Priorité transverse
**Sécurité d'abord** — isolation réseau (seul le proxy exposé), moindre privilège DB,
BO durci (MFA, rate-limit), pipeline d'upload sécurisé. Cf. `.claude/rules/STACK_SECURITY.md`.

## Dernière livraison
- Setup `.claude/` (CLAUDE.md, settings, 9 fiches rules/, 11 playbooks). Pas de version applicative.

## Prochaines étapes
Voir `TASKS.md`.
