# STACK.md — Docker

## Services (7)
| Service | Image | Exposé | Rôle |
|---|---|---|---|
| `proxy` | Caddy | **443** (seul exposé) | Reverse proxy, HTTPS auto, en-têtes sécu |
| `web` | Next.js | via proxy | Site public (`yohan-debusscher.com`) |
| `admin` | Next.js | via proxy | Back office (`bo.yohan-debusscher.com`) |
| `converter` | container webp custom | **interne** | Conversion image → webp + strip EXIF |
| `minio` | MinIO | lecture via proxy / écriture interne | Stockage images |
| `db` | PostgreSQL 16 | **interne** | DB `portfolio` + DB `umami` (rôles séparés) |
| `umami` | Umami | collecte publique / dashboard derrière auth | Statistiques |

## Réseaux (isolation = sécurité)
- `edge` : `proxy` ↔ `web` / `admin` / `umami` / lecture MinIO. Seul `proxy` publie un port.
- `internal` (`internal: true`, **aucun accès Internet**) : `db`, `converter`, écriture MinIO,
  joignables uniquement par `web`/`admin`.
- **Jamais** publier le port de `db` en prod (pas de `5432:5432`).

## Conventions Dockerfile
- Multi-stage (build → runtime minimal). Images de base minimales (distroless/alpine).
- Conteneurs **non-root** (`USER`), pas de capacités superflues, filesystem read-only quand possible.
- Pas de secret dans l'image ni dans les layers — via `.env` git-ignoré / Docker secrets.
- Coding norms : `.claude/playbooks/tech-docker.md`.

## Commands
- Start : `docker compose up`
- Build d'un service : `docker compose build <service>` puis `docker compose up -d <service>`
- Reset DB (DESTRUCTIF, **confirmation explicite requise**) : `docker compose down -v && docker compose up`

## Forbidden paths
- `.env` (secrets, ne jamais lire)
- `docker compose down -v` sans confirmation explicite (perte irréversible des volumes)
