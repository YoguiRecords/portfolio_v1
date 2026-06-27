# STACK.md — Stockage (MinIO)

## Overview
- **MinIO** (compatible S3) | stockage des images du portfolio
- **Écriture** : interne uniquement (credentials serveur). **Lecture** : bucket public via proxy.

## Buckets
- `media` (public en lecture) : images webp servies via `…/media/*` par Caddy.
- (optionnel) `private` : assets non publics, jamais routés par le proxy, accès serveur uniquement.

## Accès (moindre privilège)
- Credentials MinIO **uniquement côté serveur** (Server Actions de `admin`) — jamais exposés au client.
- Le navigateur ne parle jamais à MinIO en écriture. Lecture = URL publique du bucket `media`.
- Clé d'accès dédiée avec policy minimale (écriture sur `media` seulement).

## Flux d'upload (rappel)
1. `admin` reçoit le fichier → validation **mime / taille / dimensions** (Zod + checks).
2. Appel HTTP **interne** au container `converter` → webp + suppression EXIF.
3. Écriture du webp dans `media` (nom de fichier **randomisé**, pas le nom d'origine).
4. Enregistrement de l'URL en DB.
- Détail sécurité : `STACK_SECURITY.md` (pipeline d'upload).

## Sécurité
- Pas d'exécution de fichiers uploadés ; stockage hors webroot (volume MinIO dédié).
- Pas de listing public du bucket (servir des objets nommés, pas l'index).
