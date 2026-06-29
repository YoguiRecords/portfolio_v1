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
  image-processor/  # image -> webp + strip EXIF (Flask/Pillow, interne)
```

Le site public est bilingue (FR par défaut à `/`, EN sous `/en`) via `next-intl` (routes
`app/[locale]/`). Le contenu vient de la DB ; l'anglais est un overlay par champ (`Translation`,
fallback FR), régénéré par IA à l'enregistrement du FR.

## Services & flux

```
Internet ─▶ Caddy (proxy) ─┬─▶ web      (yohan-debusscher.com)
                           ├─▶ admin    (bo.yohan-debusscher.com)
                           ├─▶ umami    (stats.yohan-debusscher.com)
                           └─▶ /media/* (MinIO, lecture publique)

Réseau interne (non exposé) :
  web   ─▶ PostgreSQL (rôle lecture seule + INSERT contact/RDV/témoignage)
  admin ─▶ PostgreSQL (rôle lecture/écriture)
  admin ─▶ image-processor (HTTP interne : image -> webp)
  admin ─▶ MinIO (écriture, credentials serveur)
  web/admin ─▶ OpenRouter (HTTPS sortant : assistant IA / chatbot ; clé en .env)
```

Les navigateurs ne communiquent qu'avec les applications Next.js (via le proxy) et lisent les
médias publics. La base de données, l'image-processor et l'écriture MinIO restent sur le réseau interne.

## Flux applicatifs
- **Lecture publique** : `web` rend les pages en Server Components (rôle `app_web`), filtrées
  (`PUBLISHED`/`APPROVED`/`PUBLIC`) avec des `select` explicites (pas de sur-fetch de PII).
- **Soumissions publiques** : formulaires contact / RDV / témoignage → Route Handlers (`web`)
  validés Zod + honeypot + rate-limit → **INSERT seul** (jamais de lecture côté public).
- **Publication programmée** : un cron appelle un endpoint protégé (`admin`, secret) qui bascule
  les actus/événements échus `SCHEDULED → PUBLISHED`.
- **Chatbot public** : `web` `/api/chat` (désactivé par défaut) assemble un prompt à garde-fous +
  contexte **public** et appelle OpenRouter ; outil de prise de RDV → `AppointmentRequest`.
- **Assistant BO** : `admin` appelle OpenRouter pour l'assistance rédactionnelle par champ et la
  traduction FR→EN à l'enregistrement.

## Services Docker

| Service | Rôle | Exposition |
|---|---|---|
| `proxy` (Caddy) | Point d'entrée unique, routage, HTTPS auto, en-têtes sécu | Public |
| `web` (Next.js) | Site public | Via proxy |
| `admin` (Next.js) | Back office | Via proxy |
| `image-processor` (Flask/Pillow) | Conversion image → webp + strip EXIF (réutilisé d'OXO) | Interne |
| `minio` | Stockage objets (images) | Lecture publique via proxy / écriture interne |
| `db` (PostgreSQL 16) | Données | Interne |
| `umami` | Statistiques (cookieless) | Collecte publique / dashboard authentifié |

## Réseaux
- `edge` : proxy ↔ applications, umami, lecture MinIO.
- `internal` (sans accès Internet) : base de données, image-processor, écriture MinIO.

## Pipeline d'upload d'images
1. Le back office reçoit le fichier et le valide (type MIME, taille, dimensions).
2. Il appelle le service `image-processor` (réseau interne) qui ré-encode en webp et supprime les métadonnées EXIF.
3. Le résultat est écrit dans le bucket `media` de MinIO (nom de fichier randomisé).
4. L'URL est enregistrée comme `MediaAsset` en base. Les vidéos/embeds (`MediaKind` VIDEO/EMBED)
   contournent la conversion et référencent une URL externe.

## Données
Schéma relationnel géré par Prisma. Voir `docs/erd/schema_erd_global.md`.

## Environnements
Les URLs sont pilotées par l'environnement : liens internes en développement, domaines directs en
production. La configuration sensible passe par des variables d'environnement, jamais en dur.
