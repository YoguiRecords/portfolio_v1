# Design — CV dynamique (corpus unique → 3 projections + PDF auto)

> Date : 2026-06-30 · Branche : `llm` · Statut : design validé, prêt pour `writing-plans`.

## Problème & contexte

Le lien « Le CV » du site (`apps/web`, hero) pointe vers `/cv`, mais **aucune page
`/cv` n'existe** → 404. Au-delà du fix, le CV doit devenir un **contenu dynamique
éditable au BO** (principe produit « tout éditable via le BO »), bilingue, et
fournir un **PDF téléchargeable** identique au CV imprimé actuel.

Aujourd'hui le CV est un fichier HTML statique (`CV_Debusscher_Visuel.html`, hors
repo) que l'utilisateur imprime manuellement en PDF (Ctrl+P → Enregistrer en PDF).

## Décision d'architecture — corpus unique, 3 projections

Le site **est** le portfolio. Le CV et le site partagent beaucoup de données, à des
**niveaux de densité différents**. On modélise donc **une source unique de vérité**
(le corpus de contenu en DB) projetée sur **trois surfaces** :

```
                 CORPUS PORTFOLIO (DB) — une seule saisie au BO
                 ├──▶ HOME (site)            : narrative, sélective (inchangée)
                 ├──▶ PAGE /cv (web)         : riche, responsive, + d'infos que le PDF
                 └──▶ CV PDF = CvDocument    : A4, 1 page, FIGÉ (= HTML actuel)
```

Mécanique : chaque enregistrement porte des **drapeaux d'inclusion par surface**
(`showOnPdf` / `showOnCvPage` / `showOnSite`) et un **ordre**. Certains **champs ne
servent qu'une surface** (ex. `description` longue affichée sur `/cv`, ignorée par le
PDF 1-page). Le PDF est le sous-ensemble **condensé** ; `/cv` est le sur-ensemble
**détaillé** ; la home garde sa curation actuelle.

**Contraintes utilisateur clés :**
- Le **PDF reste comme aujourd'hui** : 1 page A4, disposition et contenu figés.
- La **page `/cv` montre plus** que le PDF (toutes les expériences, tous les projets,
  descriptions longues).
- Le générateur PDF **n'imprime QUE le `CvDocument`**, jamais la page `/cv`.

## Modèle de données

Champs texte traduisibles via l'overlay `Translation` existant (FR base + EN).

### Entités étendues (existantes — migrations additives, site intact)

| Entité | Ajouts | Usage |
|---|---|---|
| `Profile` | `cvAccroche`, `cvAvailabilityStart`, `cvMobility`, `cvContractType` | accroche + bloc « Disponibilité » |
| `Skill` | `kind` (`TECH`\|`SOFT`), `category` (Management, Gestion de projet, Développement, IA & Orchestration, Communication), `showOnCv` | Compétences (5 catégories) + Soft Skills (même table, `kind` distinct) |
| `Project` | `showOnCv`, `cvBadge` (`KEY`\|`IN_PROGRESS`\|`NONE`) | Réalisations (cartes, badges) |
| `Kpi` | `showOnCv` | « En chiffres » |

### Nouvelles entités (spécifiques CV)

- **`Experience`** — `title`, `company`, `location?`, `startDate`, `endDate?`
  (null = en cours), `tier` (`FEATURED`\|`PREVIOUS`\|`MINI`), `badge`
  (`PERSO`\|`EN_COURS`\|`CLE`\|`NONE`), `stack` (string[]), `bullets` (string[]),
  `description?` (longue, /cv only), `order`, flags `showOnPdf`/`showOnCvPage`/`showOnSite`.
  Traduisibles : title, company, bullets, description.
- **`Education`** (Formations) — `title`, `institution?`, `date`, `details?` (string[]), `order`, flags.
- **`Language`** (Langues) — `name`, `level`, `order`.
- **`Interest`** (Intérêts) — `label`, `order`.

### PDF généré (bilingue)

Table **`CvExport`** : `{ locale, url, generatedAt, sizeBytes }` — une ligne par
langue, upsert à chaque génération. Sert le dernier PDF figé et affiche « dernier
généré le… » au BO. Pas d'historique de versions (YAGNI).

## Rendu (3 projections)

1. **`CvDocument`** (composant React) = reproduction **fidèle** du HTML/CSS A4 actuel,
   piloté par les données, sous-ensemble `showOnPdf`. Vit sur une **route interne de
   l'app `admin`** (`/internal/cv-document?locale=fr|en`), **jamais exposée** par Caddy.
   C'est cette route que le conteneur headless visite et imprime. **Inter self-hosté**
   (pas de Google Fonts — le réseau interne n'a pas Internet, + RGPD).
2. **Page `/cv` publique** = projection **riche** dans la DA du site (web-native,
   responsive, pas le layout A4), montre tout, + boutons « Télécharger le PDF » (FR/EN)
   + aperçu optionnel du document A4. Réutilise les composants DA de la home (+ nouveaux
   au besoin).
3. **Home** = inchangée.

## Pipeline PDF + conteneur

```
BO clic « Générer le PDF » (Server Action admin authentifiée)
  └─▶ service interne « cv-renderer » (Chromium headless durci)
        visite admin:3101/internal/cv-document?locale=fr|en
        page.pdf({ printBackground:true, preferCSSPageSize:true })
        └─▶ PDF bytes ─▶ Server Action ─▶ MinIO (bucket media, nom randomisé)
              └─▶ upsert CvExport { locale, url, generatedAt }
Page /cv : bouton « Télécharger » → sert CvExport.url (figé)
```

**Nouveau service Docker (8ᵉ) `cv-renderer`** (modèle `converter`) :
- réseau `internal` uniquement, **aucun accès Internet**, non-root, FS read-only,
  **aucun port publié**, image minimale, **Inter embarqué** (poids 300→900).
- endpoint HTTP interne `POST /render {locale}` → octets PDF. Appelé **uniquement**
  par `admin`.
- réglages d'impression répliquant le Ctrl+P manuel : `printBackground:true`
  (fonds sombres + or), `preferCSSPageSize:true` (respecte `@page { size:A4; margin:2mm }`).
- tech : Playwright (déjà dans l'écosystème) ou Puppeteer — tranché au plan.
- **1 clic → génère FR + EN**.

## Sécurité (Principe n°0)

- `cv-renderer` isolé/durci (cf. ci-dessus), aucun secret dans l'image.
- Route `/internal/cv-document` jamais routée par Caddy + garde applicative (token/header
  interne attendu) — défense en profondeur.
- Génération = Server Action admin authentifiée uniquement, CSRF (pattern existant),
  entrées validées **Zod**.
- PDF dans MinIO `media` (lecture publique = voulu, c'est un téléchargement), noms randomisés.

## BO — CRUD + i18n

Réutilise l'infra existante : `LocalizedField` (FR/EN), `on-save-translate`, kit UI
(`data-table`, `drawer`, `save-bar`, `field`, `switch`, `select`, `ConfirmSubmitButton`,
`PageContainer`). Drag-to-reorder via **`@dnd-kit/sortable`** (dépendance validée ;
`@dnd-kit/core` déjà présent).

Écrans : Expériences (nouveau), Formations (nouveau), Langues (nouveau), Intérêts
(nouveau), Compétences (étendu : kind/category/showOnCv), Projets (étendu :
showOnCv/cvBadge), KPI (étendu : showOnCv), Profil (étendu : champs CV), panneau CV
(génération PDF : bouton + « dernier généré le… » + aperçu + download).

Validation : un schéma **Zod par entité** dans `packages/core` ; Server Actions dans
`apps/admin/lib/actions` ; suppressions protégées par `ConfirmSubmitButton`.

## Tests (NON-NÉGOCIABLE)

- **Unit** (Vitest) : schémas Zod (rejet d'entrées invalides), logique de projection
  (filtres `showOnPdf`/`showOnCvPage`/`showOnSite`), upsert `CvExport`, Server Actions (mocks).
- **E2E** (Playwright) : CRUD BO (create/edit/reorder), flux « Générer PDF », `/cv`
  FR+EN, téléchargement.
- **Navigateur réel (MCP Playwright)** : `/cv` desktop + mobile, FR et EN, drag-reorder
  à la main, download — screenshots.
- **Fidélité PDF** : diff visuel du `cv-fr.pdf`/`cv-en.pdf` généré vs le PDF imprimé à la
  main (référence), FR et EN.

## Séquencement — 6 PRs atomiques `llm → dev`

| PR | Contenu | Effet |
|---|---|---|
| 1 | Modèle de données (migrations Prisma additives + seed + types) | site intact |
| 2 | CRUD BO (écrans + i18n + Zod + Server Actions + drag-reorder) | saisie du contenu CV |
| 3 | `CvDocument` (port fidèle HTML→composant, Inter self-hosté) + route interne | rendu A4 unique |
| 4 | Service `cv-renderer` (Docker + compose + job CI) + génération PDF→MinIO→CvExport | PDF auto bilingue |
| 5 | Page `/cv` publique riche (DA réutilisée, FR/EN, download) | **tue le 404** |
| 6 | Docs (ARCHITECTURE, SECURITY, API_REFERENCE, patch_note, PROGRESS, TASKS) | clôture |

Note : le 404 `/cv` persiste jusqu'à la PR5 (choix « option complète » assumé). PRs
resequençables.

## Hors périmètre (YAGNI)

- Historique de versions des PDF.
- Génération PDF à la volée par requête publique (toujours pré-généré + servi figé).
- Redesign du CV (disposition figée = HTML actuel).
