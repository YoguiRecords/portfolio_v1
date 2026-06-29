# Patch notes — v0.5.x

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
