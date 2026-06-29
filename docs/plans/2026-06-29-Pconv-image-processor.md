# P-conv — Migration du convertisseur d'images OXO (image-processor) — Plan rapide

> Demande utilisateur : réutiliser l'outil OXO `image-processor` (webp), le **remonter sur
> le Docker du portfolio** (attention au port), et porter l'UX `AdminImageUploader` (Vue) en
> React pour le back office. **Contrainte absolue : ne RIEN modifier dans le projet OXO** —
> on duplique le code à l'intérieur du portfolio, toute adaptation se fait sur la copie.

## Source (OXO, lecture seule)
- `services/image-processor/` : **Flask + Pillow** (`app.py`, `Dockerfile`, `requirements.txt`).
  - `POST /convert` (multipart) : `file` + `quality` (1–100, déf. 82), `max_width` (déf. 1920),
    `strip_metadata` (déf. true), `lossless` (déf. false). Gère la transparence (RGBA), resize
    LANCZOS si `width > max_width`, strip EXIF/ICC. Retourne `image/webp`.
  - `GET /health`. Runtime : gunicorn sur **5050** (root, `python:3.13-slim`).
- `backoffice_front/components/ui/AdminImageUploader.vue` (+ `WebpConfig.vue`) : drag-drop,
  preview base64, champ **alt** obligatoire, options WebP, hint ratio/taille, émet le `File`.

## État portfolio (existant)
- `services/converter/` : **Node/Fastify/sharp** (webp + strip EXIF + validation mime/taille/dim),
  **interne**, port **5050**, déjà câblé dans `docker-compose.yml` (réseau `internal`).
- ⚠️ **Collision de port 5050** entre l'ancien converter et l'image-processor OXO.

## Décision
**Remplacer** le converter Node par l'`image-processor` Python d'OXO (plus complet : `max_width`,
`lossless`, `method`, transparence). Pas de double exécution → pas de collision réelle (réseaux
compose isolés ; service **interne**, jamais publié sur l'hôte). On garde le port interne **5050**
(le nom de service change : `converter` → `image-processor`). L'env d'appel admin passe de
`CONVERTER_URL` à `IMAGE_PROCESSOR_URL=http://image-processor:5050`.

## Tâches (TDD, atomiques sur `llm`)

### T1 — Dupliquer + durcir le service dans le portfolio
- Copier `app.py`/`requirements.txt`/`Dockerfile` OXO → `services/image-processor/` (portfolio).
- **Durcir** (norme STACK_DOCKER) : `USER` non-root, `.dockerignore`, garder `/health`,
  `EXPOSE 5050`. Optionnel : plafond taille requête (Flask `MAX_CONTENT_LENGTH`).
- Retirer `services/converter/` (Node) **après** bascule verte.

### T2 — docker-compose
- Remplacer le bloc `converter` par `image-processor` (réseau `internal`, **aucun port publié**,
  healthcheck `curl /health`). Mettre à jour les `depends_on` et l'env `IMAGE_PROCESSOR_URL`
  côté `admin`. Vérifier `docker compose up -d image-processor` → `/health` 200 (interne).

### T3 — Service d'appel admin (P11)
- `apps/admin/lib/media/convert.ts` : POST multipart vers `IMAGE_PROCESSOR_URL/convert`
  (quality/max_width/strip_metadata), récupère le webp, le passe à l'upload MinIO → `MediaAsset`.
- Validation **Zod** à la frontière (mime/taille/dimensions) avant l'appel.
- Test : mock du fetch (contrat /convert), AAA.

### T4 — Porter `AdminImageUploader` en React (P11)
- `apps/admin/components/ui/AdminImageUploader.tsx` : drag-drop + preview + **alt obligatoire**
  + options WebP (quality/lossless/maxWidth/stripMetadata) + hints ratio/taille. Émet le `File`.
- SVG : pas de conversion webp (passthrough validé) — comme OXO (`isSvg`).
- Test RTL : sélection de fichier → preview + callback `onFileChange`.

### T5 — E2E (P11)
- Parcours BO : upload image → conversion → MinIO → `MediaAsset` affiché. LLM/externes mockés.

## Risques / notes
- **Port** : ne jamais publier 5050 sur l'hôte (interne only). Si l'ancien converter Node tourne
  encore en local, l'arrêter avant (`docker compose rm -sf converter`).
- **Avatar déjà en place** : la photo de profil a été convertie manuellement (sharp) puis poussée
  dans MinIO (`media/profile.webp`). Une fois T3 livré, la re-générer via le service pour cohérence.
- **minio-init** : l'utilisateur signale que `minio-init` ne se lance pas → à diagnostiquer (le
  bucket `media` est déjà public en lecture, donc non bloquant pour l'avatar ; voir PROGRESS).
- Ce plan s'intègre à **P11** (upload média BO) : T3/T4/T5 y seront exécutés ; T1/T2 peuvent
  être faits dès maintenant (infra).
