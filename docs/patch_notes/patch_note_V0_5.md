# Patch notes — v0.5.x

## v0.5.1 — Application réelle de la DA v2 + mutualisation + anti-drift DB (2026-06-30)

Correctifs et durcissement de la livraison BO v2 : le thème validé n'était pas réellement appliqué
au runtime, plus mutualisation du markdown et automatisation des migrations.

### Design (correctif)
- **DA v2 enfin appliquée** : `globals.css` + `layout.tsx` adoptent la base **graphite sombre + or +
  Inter**. Le boilerplate Next par défaut (fond blanc, police Geist/Arial) écrasait les tokens → le BO
  s'affichait **en blanc**. Corrigé : `body` sur `--color-bg`/`--color-ink`, police **Inter**.
- **Purge des couleurs en dur** : 18 fichiers, ~230 classes `zinc-*`/`amber-*`/`emerald-*` remplacées
  par les tokens de la DA (DoD « zéro couleur en dur » respectée ; 2 `bg-white` légitimes conservés :
  QR TOTP scannable, iframe « papier » du CV).

### Mutualisation — `@portfolio/ui`
- Nouveau package partagé : **parser markdown sûr** (`parseMarkdown`) commun à `web` et `admin`
  (fin de la duplication du renderer sécurité-critique). Habillage propre à chaque app conservé.
- **`BRAND`** = source canonique de l'or, avec **test de drift** garantissant que `web` et `admin`
  déclarent la même valeur (anti-divergence). Primitives `ui/` laissées dans `admin` (non partagées).

### Docker / DB (correctifs + anti-drift)
- **Build images corrigé** : `prisma generate` exécuté avant `next build` dans les Dockerfiles
  `web` et `admin` (le rebuild échouait sur le client Prisma non généré).
- **Service one-shot `migrate`** : applique `prisma migrate deploy` à chaque `docker compose up`,
  **avant** `web`/`admin` (rôle propriétaire, réseau interne, idempotent) → le schéma et la DB ne
  peuvent plus diverger. Migrations `crm` + `rbac` appliquées (colonne `AdminUser.role` manquante).

### Tests
- **266 tests** Vitest verts (dont `@portfolio/ui` : 5 markdown + 2 drift) ; `next build` web+admin,
  `tsc`, lint verts.

## v0.5.0 — Refonte back office « BO v2 » + CRM + chatbot (2026-06-30)

Refonte complète du back office (`apps/admin`) sur un design-system unifié (graphite + or), ajout
d'un CRM complet, d'une boîte de réception unifiée et activation du chatbot public.

### Design & shell
- **Design-system v2** : tokens Tailwind (`@theme`) + 18 primitives UI testées (`components/ui/*`).
- **Shell v2** : rail à icônes groupé (Contenu / Relation client / Mesure), topbar (recherche ⌘K,
  notifications, Créer, avatar), barre de navigation **mobile** + tiroir ; compteurs serveur.
- **Palette ⌘K** globale (navigation rapide).

### Contenus (reskin + aperçu live)
- **Dashboard v2** : KPIs (trafic Umami avec repli), « à traiter », top contenus.
- **Projets / Articles / Profil** : éditeurs avec **aperçu live** réduit & fermable ; articles avec
  **publication programmée** ; renderer markdown sûr ; **CV HTML** rendu **isolé** (iframe sandbox).
- **Médias** : médiathèque (dropzone + grille + panneau détails). **Témoignages** : modération v2.
- **Agenda + RDV** : file de demandes (accepter → **évènement calendrier**, refuser).

### Relation client
- **Boîte de réception unifiée** : Mails (Microsoft Graph) + Messages de contact, réponse par email.
- **CRM** : Contacts (fiche 360°), Sociétés, **Pipeline** (deals par stage), activités & tâches.
  Tables **privées** (`app_web` REVOKE, comme `ContactMessage`).
- **Mission Control** : pilotage agrégé (KPIs relation client, pipeline, tâches, à-traiter, inbox).

### Sécurité
- Toutes les routes BO sous guard MFA ; entrées validées Zod ; migration CRM avec `REVOKE app_web`.
- CV HTML isolé (iframe sandbox) ; clés (OpenRouter/Graph) en `.env` uniquement.

### Tests
- ~148 tests unitaires/composants (admin) + 48 (core) ; `next build`, `tsc`, lint verts.
- E2E : guard des nouvelles routes BO (redirection /login sans session).
