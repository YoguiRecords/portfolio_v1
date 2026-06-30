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
  ui/         # parser markdown sûr partagé (web+admin) + constantes de marque (BRAND)
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
  admin ─▶ cv-renderer (HTTP interne : imprime la route admin /internal/cv-document -> PDF)
  admin ─▶ MinIO (écriture, credentials serveur)
  web/admin ─▶ OpenRouter (HTTPS sortant : assistant IA / chatbot ; clé en .env)
  admin     ─▶ Microsoft Graph (HTTPS sortant : mail + calendrier Outlook, OAuth app-only ; optionnel)
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
- **Mail & calendrier BO** : ports `Mailbox`/`CalendarProvider` (`@portfolio/core/integrations`).
  Calendrier = DB du site (agenda + RDV) **+** Outlook si configuré ; mail = boîte Exchange réelle
  via Microsoft Graph (OAuth app-only) ou démo. Détail : `docs/technical/INTEGRATIONS.md`.

## Services Docker

| Service | Rôle | Exposition |
|---|---|---|
| `proxy` (Caddy) | Point d'entrée unique, routage, HTTPS auto, en-têtes sécu | Public |
| `web` (Next.js) | Site public | Via proxy |
| `admin` (Next.js) | Back office | Via proxy |
| `image-processor` (Flask/Pillow) | Conversion image → webp + strip EXIF (réutilisé d'OXO) | Interne |
| `cv-renderer` (Node/Playwright) | Imprime la route interne `admin /internal/cv-document` en **PDF** (Chromium headless durci) | Interne |
| `minio` | Stockage objets (images + PDF du CV) | Lecture publique via proxy / écriture interne |
| `minio-init` | One-shot : crée le bucket `media` (lecture publique) puis s'arrête | Interne |
| `migrate` | One-shot : applique `prisma migrate deploy` (rôle propriétaire) avant web/admin → schéma toujours synchronisé | Interne |
| `db` (PostgreSQL 16) | Données | Interne |
| `umami` | Statistiques (cookieless) | Collecte publique / dashboard authentifié |

## Réseaux
- `edge` : proxy ↔ applications, umami, lecture MinIO.
- `internal` (sans accès Internet) : base de données, image-processor, cv-renderer, écriture MinIO.

## Pipeline d'upload d'images
1. Le back office reçoit le fichier et le valide (type MIME, taille, dimensions).
2. Il appelle le service `image-processor` (réseau interne) qui ré-encode en webp et supprime les métadonnées EXIF.
3. Le résultat est écrit dans le bucket `media` de MinIO (nom de fichier randomisé).
4. L'URL est enregistrée comme `MediaAsset` en base. Les vidéos/embeds (`MediaKind` VIDEO/EMBED)
   contournent la conversion et référencent une URL externe.

## CV dynamique — corpus unique, 3 projections
Le CV est un **contenu éditable au BO**, modélisé comme un **corpus unique** en base
(`Experience`, `Education`, `Language`, `Interest`, + drapeaux CV sur `Profile`/`Skill`/`Project`/`Kpi`)
projeté sur **trois surfaces** via des drapeaux d'inclusion (`showOnPdf` / `showOnCvPage` / `showOnSite`) :
- **Home** : curation existante (inchangée).
- **Page `/cv`** (web) : projection **riche** (`showOnCvPage`/`showOnCv`), bilingue, responsive.
- **PDF A4** : composant `CvDocument` (sous-ensemble `showOnPdf`), rendu sur la route interne
  `admin /internal/cv-document?locale=fr|en` (jamais routée par Caddy, garde par token).

**Pipeline de génération PDF** (un clic BO → FR + EN) :
1. `generateCvPdfAction` (admin authentifiée) appelle le service interne `cv-renderer`.
2. `cv-renderer` (Chromium headless) visite la route interne, imprime en PDF
   (`printBackground`, `preferCSSPageSize` → A4).
3. Le PDF est écrit dans MinIO `media` (nom randomisé) et la ligne `CvExport` (une par locale) est upsert.
4. La page `/cv` sert les PDF **figés** (téléchargement), via l'URL publique MinIO.

## Back office (BO v2)
Le back office (`apps/admin`) s'appuie sur un **design-system de primitives** (`components/ui/*`,
tokens graphite + or) et un **shell** rail-icônes + topbar + barre mobile (`components/admin-layout/*`).
Modules : Dashboard (portfolio/audience) et **Mission Control** (relation client/à-traiter) distincts ;
éditeurs avec **aperçu live** (`components/live-preview`) pour projets/articles/profil ; **boîte de
réception unifiée** (mails Graph + messages de contact ; RDV traités à part) ; **CRM** (Contacts +
Sociétés + Pipeline + activités/tâches) en **données privées** (`app_web` REVOKE) ; **palette ⌘K**
globale. Le CV HTML est rendu **isolé** (iframe sandbox).

## Données
Schéma relationnel géré par Prisma. Voir `docs/erd/schema_erd_global.md`. Les tables CRM
(`Company`/`Contact`/`Deal`/`Activity`/`Task` — table `CrmTask` conservée) sont privées (back office uniquement).
Les migrations sont appliquées automatiquement par le service one-shot `migrate` à chaque
démarrage de la stack (avant `web`/`admin`) : le schéma et la base ne peuvent pas diverger.

## Environnements
Les URLs sont pilotées par l'environnement : liens internes en développement, domaines directs en
production. La configuration sensible passe par des variables d'environnement, jamais en dur.
