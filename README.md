# Portfolio — Yohan Debusscher

Portfolio personnel : CV, projets et newsletter. Site public + back office, conteneurisé,
derrière un reverse proxy. **La sécurité est la priorité directrice du projet.**

## Stack

- **Monorepo** pnpm workspaces (`apps/*`, `packages/*`)
- **Next.js 16** (App Router, TypeScript strict) — `apps/web` (public) & `apps/admin` (back office)
- **PostgreSQL 16 + Prisma** — `packages/db`
- **Tailwind CSS v4**
- **MinIO** (stockage images) + container **converter** (image → webp)
- **Umami** (statistiques cookieless, RGPD)
- **Caddy** (reverse proxy, HTTPS auto) — seul point d'entrée
- **Docker Compose** (7 services)

## Architecture

```
Internet ─▶ Caddy (443) ─┬─▶ web    (yohan-debusscher.com)
                         ├─▶ admin  (bo.yohan-debusscher.com)
                         ├─▶ stats  (stats.yohan-debusscher.com)
                         └─▶ /media (MinIO, lecture publique des images)

Réseau interne (jamais exposé) :
  web/admin ─▶ Postgres | admin ─▶ converter | admin ─▶ MinIO (écriture)
```

```
apps/
  web/      # site public (SSR/SEO)
  admin/    # back office (auth durcie)
packages/
  db/       # Prisma (schéma + client)
  core/     # types & utils partagés
```

## Démarrage

```bash
pnpm install
docker compose up        # stack complète
pnpm --filter web dev    # site public
pnpm --filter admin dev  # back office
```

## Sécurité

Isolation réseau (seul le proxy exposé), moindre privilège DB, back office durci
(MFA, rate-limit), pipeline d'upload sécurisé (validation + ré-encodage + strip EXIF).
Posture complète : voir `.claude/rules/STACK_SECURITY.md`.

## Documentation interne

Conventions et normes du projet : dossier `.claude/` (fiches `rules/` + `playbooks/`).

---

© 2026 Yohan Debusscher. Tous droits réservés.
