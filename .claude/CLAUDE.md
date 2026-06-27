# CLAUDE.md — Portfolio (Yohan Debusscher)

## Principe n°0 — Sécurité d'abord (NON-NÉGOCIABLE)
La cybersécurité prime sur tout le reste. À chaque décision (archi, dépendance, code,
config), se poser d'abord : « est-ce que ça augmente la surface d'attaque ? ».
- Rien n'est exposé sur Internet sauf via le proxy (Caddy). DB, MinIO (écriture),
  converter ne sont **jamais** joignables de l'extérieur.
- Moindre privilège partout (rôles DB, credentials, capacités containers).
- Valider **toutes** les entrées externes (Zod), jamais de secret en dur.
- Détail de la posture : `.claude/rules/STACK_SECURITY.md`.

## Stack & contexte projet
Site portfolio (CV, projets, news/articles) + back office, conteneurisé, derrière proxy.
Ne PAS charger ces fiches en permanence — les lire UNIQUEMENT si nécessaire pour la tâche.

### Fiches techno (`.claude/rules/`)
- Next.js / monorepo / TypeScript : `.claude/rules/STACK_NEXTJS.md`
- PostgreSQL / Prisma : `.claude/rules/STACK_POSTGRES.md`
- Docker / services : `.claude/rules/STACK_DOCKER.md`
- Proxy (Caddy) : `.claude/rules/STACK_PROXY.md`
- Stockage (MinIO) : `.claude/rules/STACK_STORAGE.md`
- Sécurité : `.claude/rules/STACK_SECURITY.md`
- Git : `.claude/rules/STACK_GIT.md`
- Testing : `.claude/rules/STACK_TESTING.md`
- Documentation : `.claude/rules/STACK_DOCUMENTATION.md`
- Direction artistique (DA / design) : `.claude/rules/DESIGN_SYSTEM.md`

### Playbooks (normes FORBIDDEN, patterns) — `.claude/playbooks/`
Lire le playbook pertinent en parallèle de la fiche STACK quand on travaille sur cette techno :
- TypeScript : `.claude/playbooks/lang-typescript.md`
- React : `.claude/playbooks/framework-react.md`
- Next.js : `.claude/playbooks/framework-nextjs.md`
- PostgreSQL : `.claude/playbooks/tech-postgresql.md`
- Docker : `.claude/playbooks/tech-docker.md`
- REST / Route Handlers : `.claude/playbooks/tech-rest-api.md`
- Tailwind CSS : `.claude/playbooks/css-tailwind.md`
- Sécurité OWASP : `.claude/playbooks/security-owasp.md`
- SOLID / DRY / KISS / YAGNI : `.claude/playbooks/paradigme-solid.md`
- Doc technique : `.claude/playbooks/doc-technique.md`
- Doc code : `.claude/playbooks/doc-code.md`

## Architecture (monorepo)
```
portfolio_v1/
  apps/
    web/        # yohan-debusscher.com    — site public (SSR/SEO), Next.js
    admin/      # bo.yohan-debusscher.com — back office (auth durcie), Next.js
  packages/
    db/         # Prisma (schéma + client) partagé par web et admin
    core/       # types & utils partagés
  docker-compose.yml
```

### Qui parle à quoi (frontière de sécurité)
Les navigateurs parlent **uniquement** à Next.js (web/admin) via le proxy. Aucun accès
direct navigateur → DB / MinIO (écriture) / converter. Tout le backend sensible reste sur
le réseau Docker interne.

```
Internet ─▶ Caddy (443) ─┬─▶ web    (yohan-debusscher.com)
                         ├─▶ admin  (bo.yohan-debusscher.com)
                         ├─▶ stats  (stats.yohan-debusscher.com — collecte publique, dashboard derrière auth Umami)
                         └─▶ /media (MinIO, lecture publique des images uniquement)

Réseau interne (jamais exposé) :
  web/admin ─▶ Postgres (Prisma)
  admin     ─▶ converter (HTTP interne : image → webp)
  admin     ─▶ MinIO (écriture, credentials serveur)
```

### Services Docker (7)
| Service | Exposé ? | Rôle |
|---|---|---|
| `proxy` (Caddy) | Oui (443) | Seul point d'entrée, HTTPS auto, en-têtes sécu |
| `web` (Next.js) | via proxy | Site public |
| `admin` (Next.js) | via proxy | Back office |
| `converter` | interne | Conversion image → webp (strip EXIF) |
| `minio` | lecture via proxy / écriture interne | Stockage images |
| `db` (Postgres) | interne | DB `portfolio` + DB `umami` (rôles séparés) |
| `umami` | collecte publique / dashboard derrière auth | Statistiques (cookieless, RGPD) |

## Workflow de dev (3 phases — OBLIGATOIRE)
1. **Analyse** : décomposer la demande, risques & dépendances, plan étape par étape
   (objectif, fichiers impactés, étapes, cas limites). Attendre validation explicite.
2. **Exécution** : suivre le plan, signaler toute déviation avant de l'appliquer.
3. **Clôture** : mettre à jour la doc/tracking impactés (voir `STACK_DOCUMENTATION.md`).

Utiliser les skills Superpowers quand disponibles
(`superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:executing-plans`).

## Fichiers de session
- Début de session : lire `PROGRESS.md` pour reconstruire le contexte.
- Avant tout dev : produire le plan + suivre le backlog dans `TASKS.md`, attendre validation.
- Fin de session : réécrire entièrement `PROGRESS.md` avec l'état courant uniquement.
- Avant toute livraison (push) : mettre à jour TOUS les docs impactés (cf. `STACK_DOCUMENTATION.md`).

## Identité projet
- **Nom :** Portfolio Yohan Debusscher
- **Domaines :** `yohan-debusscher.com` (public) / `bo.yohan-debusscher.com` (back office) /
  `stats.yohan-debusscher.com` (Umami)
- **Branche main :** `main` (réservée à l'utilisateur) — **branche dev :** `dev`

## Quick start
```bash
docker compose up        # stack locale complète
pnpm --filter web dev    # site public en dev
pnpm --filter admin dev  # back office en dev
```

## Principe produit — tout éditable via le BO
**Tout le contenu éditable est géré via le back office (`admin`)** : profil/identité, projets,
articles/news, médias, CV (HTML stocké en DB). Aucune donnée de contenu codée en dur dans le code.
Seuls les éléments non éditables (DA, structure) restent au niveau du code/config.

## Principes (non-négociables)
SOLID, DRY, KISS, YAGNI strictement appliqués. Naming explicite, pas de magic
numbers/strings, pas de nesting > 3 niveaux, early returns, pas de catch silencieux,
pas de code mort. Aucune nouvelle dépendance sans validation préalable.
