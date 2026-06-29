# Patch notes — v0.4.x

## v0.4.1 — Contact & demande de RDV (2026-06-29)

- Page `/contact` : formulaire de **contact** (→ `ContactMessage`) et de **demande de RDV**
  (→ `AppointmentRequest`, `source=CONTACT`, statut `PENDING`). Endpoints `POST /api/contact` et
  `/api/appointments` : **insert-only** (`app_web`), validation **Zod** + **honeypot** + **rate-limit**
  (5/h/IP). Aucune lecture de PII côté web (inbox réservée au BO). Modules clients réutilisables, E2E.

## v0.4.0 — Site bilingue FR/EN + timeline animée restaurée (2026-06-29)

### Internationalisation (Pi18n)
- **Routing bilingue** (`next-intl`) : FR canonique à `/`, EN à `/en` (préfixe `as-needed`,
  **pas de redirection Accept-Language** — `/` reste FR). Sélecteur de langue dans la nav.
- **Overlay de contenu** : table générique `Translation(model, recordId, field, locale, value,
  isAuto, sourceHash)` ; helper `localize()` superpose l'EN avec **fallback FR**. La home applique
  l'overlay (ex. titre de section traduit) ; les autres loaders restent à câbler (mécanique).
- **Traduction IA** (`translateFields`, port LLM mocké en test) + **re-traduction au save** :
  quand le FR change, l'EN est **régénéré et écrasé** (même s'il était édité main) ; FR inchangé →
  **aucun appel LLM**. Détection via `sourceHash` (sha-256).
- **BO** : composant `LocalizedField` (EN **caché par défaut**, dépliable, sauvegarde manuelle
  `isAuto=false`, régénération, badges auto/édité, mention « toute modif FR réécrase l'EN »).
- Chrome FR/EN (`messages/{fr,en}.json`). E2E : `/` FR, `/en` EN, bascule de langue.

### Correctif DA
- **Timeline animée du parcours restaurée** (regression de P2) : version desktop « 4 voies + axe
  temporel » (couleurs des voies depuis la DB, animations line-grow/sweep/convergence au scroll),
  mobile chronologique. Module CSS dédié, data-driven.

### Outillage
- Suites de tests DB **sérialisées** (`maxWorkers=1` + `--workspace-concurrency=1`) → fin des races
  sur le schéma `test` partagé. Admin passe en **jsdom** (RTL) ; configs vitest exclues du typecheck.
- Builds natifs `@swc/core` / `@parcel/watcher` approuvés (pnpm allowBuilds).

### Tests
- **75 tests** Vitest (core 26, db 3, admin 18, web 28) + **10 E2E** Playwright, tous verts.
