# Patch notes — v0.8.x

## v0.8.4 — 2026-07-01 — Réservation de créneaux par Friday

Friday peut désormais **réserver un rendez-vous** de bout en bout.

### Côté visiteur (site public)
- **Carte-formulaire dans le chat** (bouton « Prendre RDV ») : prénom, nom, email, téléphone,
  motif + **choix d'un vrai créneau libre**. Données validées côté serveur (Zod `BookingInput`),
  aucune extraction par le LLM.
- **Créneaux réels** : lundi→samedi 9h→20h (Europe/Paris), 30 min à l'heure pile, moins les RDV
  déjà pris, les évènements Outlook et les congés déclarés. Dimanche exclu.
- La demande crée un RDV **PENDING** qui **bloque le créneau immédiatement**. Message : « Yohan
  validera dès que possible + email de confirmation ».
- **Annulation self-service** : lien tokenisé (`/rdv/annuler?token=…`) → libère le créneau.

### Côté BO (admin)
- Page **/disponibilites** : déclarer congés / indispos (bloque tous les créneaux de la période).
- **/rdv** : accepter (→ CONFIRMED + évènement Outlook best-effort + email de confirmation avec
  lien/lieu + lien d'annulation), refuser, **annuler un RDV confirmé** — chaque geste libère le
  créneau et notifie le visiteur (emails Microsoft Graph, best-effort).
- **/calendrier** : affiche aussi les RDV en attente (chatbot) et les congés.

### Sécurité & technique
- `app_web` (site public, lecture seule) **ne lit jamais** le calendrier/RDV privés : disponibilités,
  réservation et annulation passent par l'**API interne d'`admin`** (`/api/internal/*`, token
  `APPOINTMENTS_INTERNAL_TOKEN`, réseau Docker `internal`, jamais routée par Caddy).
- Anti double-booking : **index unique partiel** sur les vraies réservations actives (confirmées, ou
  en attente issues du chatbot). Les leads souples du formulaire de contact restent non bloquants.
- Calcul des créneaux : fonction pure `computeFreeSlots` (timezone-aware Paris via `Intl`, testée).
- Migration `20260701010000_friday_booking` (identité + `cancelToken` + `Unavailability`, REVOKE
  `app_web` sur `Unavailability`).

## v0.8.3 — 2026-07-01 — Identité de l'e-secrétaire (nom + avatar) + ton plus concis

- **Nom éditable au BO** : le chatbot a un prénom (`AiAssistantConfig.assistantName`, défaut
  **« Friday »**, migration `20260701000400`) — affiché dans l'entête du widget et injecté dans le
  prompt (elle se présente sous ce prénom, à la 3ᵉ personne pour Yohan).
- **Avatar éditable au BO** : `assistantAvatarUrl` (migration `20260701000500`) — image de profil
  affichée sur la bulle flottante et l'entête ; **fallback monogramme doré** si vide. Réglable par
  **upload direct** sur `/ai` (`uploadAssistantAvatarAction` → pipeline converter/MinIO, aperçu live)
  ou par URL de média.
- **Ton plus concis** : la persona par défaut adapte la longueur à la question (à un simple bonjour →
  réponse brève, sans dérouler le profil).

## v0.8.2 — 2026-07-01 — Chatbot public activable + FAQ publique (SEO) + finitions

Suite de la recette : les deux fonctionnalités « inexploitables de bout en bout » sont livrées,
plus deux finitions.

### Chatbot public — pleinement fonctionnel
- **Clé câblée** : `OPENROUTER_API_KEY` (déjà dans `.env`) n'était transmise à aucun conteneur.
  Ajoutée aux blocs `environment:` de `web` **et** `admin` dans `docker-compose.yml` (même clé).
- **Activation au BO** : formulaire sur `/ai` (`updateAiConfigAction`, gardé) — bascule
  `isPublicChatEnabled`, assistance BO, **modèle** (slug OpenRouter éditable), **persona**
  (garde-fous), **budget mensuel**. Plus besoin de toucher la base.
- **Garde-fou budget effectif** : `/api/chat` estime les tokens, applique `assertBudget` avant
  l'appel et **incrémente** `tokensUsedThisMonth` après (UPDATE brut de la seule colonne compteur →
  migration `20260701000200_chat_budget_grant`, `GRANT UPDATE (tokensUsedThisMonth)` à `app_web`).
- **Modèle + persona par défaut** : `deepseek/deepseek-v4-flash` (unique, propre, peu coûteux — fini
  le format multi-modèles verbeux de `openrouter/fusion`) via migration `20260701000300` + seed. La
  persona par défaut fait du chatbot la **« secrétaire personnelle » de Yohan** : réponses
  **synthétiques** (2–4 phrases), 3ᵉ personne, propose un rendez-vous. Tout éditable au BO.
- **Robustesse** : une erreur fournisseur/modèle sur `/api/chat` renvoie désormais `502`
  (message convivial) au lieu d'un `500` brut.
- Validé navigateur : activation via BO → widget → réponse LLM réelle, synthétique, ton secrétaire →
  budget décompté.

### FAQ publique (SEO)
- Page **`/faq`** dédiée (scope GLOBAL) : accordéon `<details>` accessible (contenu crawlable) +
  **FAQPage JSON-LD** (éligible rich results) + lien dans la nav. Rendu markdown sûr des réponses.
- **FAQ projet/article rendues visibles** (accordéon) en plus du JSON-LD existant — Google exige le
  contenu visible pour valider le schema. Couche data `listFaq(scope)`, seed GLOBAL de départ.

### Finitions
- **Dimensions média persistées** : le converter expose `X-Image-Width/Height`, lus par le pipeline
  d'upload → `MediaAsset.width/height` renseignés (panneau détails complet).
- **Gantt « Démarche » (mobile)** : masquage du texte in-barre ≤640px (redondant avec le libellé de
  ligne) → plus de débordement/troncature sur petit écran.

## v0.8.1 — 2026-07-01 — Correctifs QA (formulaires publics, droits DB, édition projet)

Passe de recette complète (tous les CRUD du back office + fonctionnalités du site + responsive
4 breakpoints). Quatre correctifs livrés.

### Sécurité / droits DB — formulaires publics réparés (bloquant)
Le rôle `app_web` (moindre privilège) écrit via des formulaires publics, mais Prisma `create()`
émet un `INSERT ... RETURNING`, qui exige `SELECT` sur les colonnes retournées. Trois surfaces
échouaient (« permission denied for table … ») :
- **Page `/temoignages`** (500) : la migration relationship/company avait ajouté `authorCompany` /
  `authorRelationship` sans étendre le grant `SELECT` par colonne d'`app_web`. Migration
  `20260701000000_testimonial_web_grant` : ré-accorde ces deux colonnes d'affichage.
- **Formulaire de contact** et **demande de RDV** (erreur à l'envoi) : `app_web` n'avait aucun
  `SELECT`, donc le RETURNING de `contactMessage.create` / `appointmentRequest.create` échouait.
  Migration `20260701000100_public_write_returning_grant` : `GRANT SELECT (id)` sur `ContactMessage`
  et `AppointmentRequest`. Le code borne le RETURNING à `id` (`select: { id: true }`) sur les trois
  créations publiques (contact, RDV, témoignage) → `app_web` ne relit jamais le message ni la PII.

### Back office
- **Édition projet — 500 corrigé** : `updateProjectAction` étalait le record Prisma (colonnes
  nullable = `null`) dans `ProjectInput.parse`, qui refusait `null` sur les champs `.optional()`.
  Conséquence : **impossible d'enregistrer un projet fraîchement créé** (champs facultatifs vides).
  Les chaînes optionnelles de `ProjectInput` acceptent désormais `null` (`.nullish()`).
- **Formulaire d'ajout de formation** : ajout des cases `PDF` / `Page /cv` (cochées par défaut,
  comme les expériences). Une formation créée est désormais visible immédiatement au lieu d'être
  masquée partout jusqu'à une seconde édition.

## v0.8.0 — 2026-07-01 — CV dynamique (corpus unique → 3 projections + PDF auto)

Le CV devient un **contenu dynamique éditable au back office**, projeté sur **trois surfaces**
(home, page `/cv` riche, **PDF A4** figé), **bilingue FR/EN**, avec génération PDF automatisée par un
conteneur headless durci. Le lien « Le CV » du site ne mène plus à un **404**.

### Données (PR1)
- Nouvelles entités : `Experience`, `Education`, `Language`, `Interest`, `CvExport` (PDF généré, une
  ligne par locale). Extensions : `Profile` (accroche/disponibilité CV), `Skill` (`kind` TECH/SOFT,
  `showOnCv`), `Project` (`showOnCv`, `cvBadge`), `Kpi` (`showOnCv`).
- Drapeaux d'inclusion par surface (`showOnPdf` / `showOnCvPage` / `showOnSite`). Migration additive
  (site intact) ; `app_web` reçoit `SELECT` via les *default privileges* du rôle propriétaire.

### Back office (PR2)
- Écrans CRUD `/experiences`, `/formations`, `/langues`, `/interets` avec **réordonnancement par
  glisser-déposer** (`@dnd-kit/sortable`, composant réutilisable `components/ui/sortable-list.tsx`).
- Écrans existants étendus : compétences (kind/catégorie/showOnCv), KPI (showOnCv), éditeur projet
  (showOnCv/cvBadge), profil (champs CV). Schémas Zod par entité (`@portfolio/core`).

### Document A4 (PR3)
- `CvDocument` : reproduction fidèle d'un CV A4 « éditorial sombre + or », **data-driven**
  (projection `showOnPdf`), **bilingue**. Rendu sur la route interne `admin /internal/cv-document`
  (hors chrome BO, **garde par token**, jamais routée par Caddy). Inter **self-hosté** (`next/font`,
  aucun appel CDN au runtime).

### Service & génération PDF (PR4)
- **Nouveau service Docker `cv-renderer`** (8ᵉ) : Chromium headless (Playwright), **durci** (non-root,
  FS read-only + `tmpfs`, `no-new-privileges`, aucun port publié, réseau interne sans Internet).
- `generateCvPdfAction` (admin authentifiée) : rend FR + EN, upload MinIO (nom randomisé), upsert
  `CvExport`. Panneau BO « Générer le PDF » + « dernier généré le… » + téléchargement.
- `proxy.ts` exempte `/internal` (protégé par token, pas par session). Image ajoutée à la CI Docker.

### Page publique (PR5)
- Page `/cv` **bilingue** et **responsive** (DA home réutilisée) : projection riche (descriptions
  longues, toutes expériences/projets) + boutons **« Télécharger le PDF »** (FR/EN) servant les PDF
  figés. Lien hero « Le CV » localisé (`/cv` ↔ `/en/cv`). **Tue le 404.**

### Notes
- i18n : champs scalaires via l'overlay `Translation` existant ; les champs tableaux (puces, stack)
  restent FR pour l'instant.
- **Prod** : définir `CV_RENDER_TOKEN` (route interne fermée par défaut sans token) et
  `MEDIA_PUBLIC_BASE_URL` (domaine public).
