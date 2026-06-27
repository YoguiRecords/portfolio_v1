# STACK.md — Proxy (Caddy)

## Overview
- **Caddy** | seul service exposé sur Internet (443) | HTTPS automatique (Let's Encrypt)
- Point d'entrée unique : tout passe par lui, rien d'autre n'est joignable de l'extérieur.

## Routage (sous-domaines)
| Hôte | Cible | Accès |
|---|---|---|
| `yohan-debusscher.com` | `web:3000` | public |
| `bo.yohan-debusscher.com` | `admin:3001` | public (auth durcie côté app) |
| `stats.yohan-debusscher.com` | `umami:3000` | collecte publique / dashboard derrière login Umami |
| `…/media/*` | `minio` (bucket public) | **lecture seule** des images |

## HTTPS
- Certs + renouvellement **automatiques** (zéro config ACME). HTTP→HTTPS forcé.
- Activer **HSTS** (`Strict-Transport-Security`) une fois les domaines stables.

## En-têtes de sécurité (posés au proxy, pour toutes les apps)
- `Content-Security-Policy` (restreindre sources scripts/styles/images)
- `X-Frame-Options: DENY` (ou CSP `frame-ancestors`)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (désactiver caméra/micro/géoloc inutiles)

## Sécurité
- Ne **jamais** exposer `db` / `converter` / écriture MinIO via le proxy.
- L'écriture MinIO reste interne ; seul le bucket **public en lecture** est routé sous `/media`.
- Config Caddyfile versionnée et minimale (moins de surface d'erreur = moins de failles).

## Coding norms
- Réseaux & isolation : `STACK_DOCKER.md` | posture globale : `STACK_SECURITY.md`
