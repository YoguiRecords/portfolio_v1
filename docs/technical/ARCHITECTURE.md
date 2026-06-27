# ARCHITECTURE

Vue système du portfolio. Décrit l'état courant.

## Vue d'ensemble
Monorepo pnpm conteneurisé, derrière un reverse proxy unique. Deux applications Next.js
(site public, back office) partagent une couche données (Prisma) et des utilitaires. Le contenu
éditable est géré exclusivement via le back office.

```
apps/
  web/        # site public (SSR/SEO)
  admin/      # back office (auth)
packages/
  db/         # Prisma (schéma + client)
  core/       # types & utils partagés
services/
  converter/  # image -> webp (interne)
```

## Services & flux

```
Internet ─▶ Caddy (proxy) ─┬─▶ web      (yohan-debusscher.com)
                           ├─▶ admin    (bo.yohan-debusscher.com)
                           ├─▶ umami    (stats.yohan-debusscher.com)
                           └─▶ /media/* (MinIO, lecture publique)

Réseau interne (non exposé) :
  web   ─▶ PostgreSQL (rôle lecture seule)
  admin ─▶ PostgreSQL (rôle lecture/écriture)
  admin ─▶ converter (HTTP : image -> webp)
  admin ─▶ MinIO (écriture, credentials serveur)
```

Les navigateurs ne communiquent qu'avec les applications Next.js (via le proxy) et lisent les
médias publics. La base de données, le converter et l'écriture MinIO restent sur le réseau interne.

## Services Docker

| Service | Rôle | Exposition |
|---|---|---|
| `proxy` (Caddy) | Point d'entrée unique, routage, HTTPS auto, en-têtes sécu | Public |
| `web` (Next.js) | Site public | Via proxy |
| `admin` (Next.js) | Back office | Via proxy |
| `converter` (Fastify/sharp) | Conversion image → webp + strip EXIF | Interne |
| `minio` | Stockage objets (images) | Lecture publique via proxy / écriture interne |
| `db` (PostgreSQL 16) | Données | Interne |
| `umami` | Statistiques (cookieless) | Collecte publique / dashboard authentifié |

## Réseaux
- `edge` : proxy ↔ applications, umami, lecture MinIO.
- `internal` (sans accès Internet) : base de données, converter, écriture MinIO.

## Pipeline d'upload d'images
1. Le back office reçoit le fichier et le valide (type MIME, taille, dimensions).
2. Il appelle le service `converter` (réseau interne) qui ré-encode en webp et supprime les métadonnées.
3. Le résultat est écrit dans le bucket `media` de MinIO (nom de fichier randomisé).
4. L'URL est enregistrée comme `MediaAsset` en base.

## Données
Schéma relationnel géré par Prisma. Voir `docs/erd/schema_erd_global.md`.

## Environnements
Les URLs sont pilotées par l'environnement : liens internes en développement, domaines directs en
production. La configuration sensible passe par des variables d'environnement, jamais en dur.
