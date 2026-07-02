# PROGRESS — état courant

> État du projet à l'instant T (réécrit à chaque fin de session, pas d'historique cumulé).
> Historique versionné → `docs/patch_notes/`.

## Version
- **Cycle en cours :** consolidation post-audit (sécurité/qualité/UX/perf) après la refonte BO v2 + Friday booking.
- **Dernier correctif :** **v0.8.6 — reliquats d'audit + Lighthouse** : ports dev → override
  compose (base prod-safe), suppression de médias au BO (garde d'usage, validée navigateur),
  hero CTA i18n, CLAUDE.md services à jour, et optimisation Lighthouse — **desktop 100/100/100/100
  (home + /cv), mobile 93-95 (CLS 0, checklists LCP toutes vertes)**, BO 97-100/A11y 100 :
  media same-origin + immutable, ISR 60 s (bf-cache), CSS inliné, content-visibility,
  typewriter SSR plein + caret zéro-largeur, llms.txt llmstxt.org, contrastes AA.
  Décisions actées : tokens web en `:root` (pas de `@theme` sans consommateur Tailwind),
  Flask durci conservé. Détail : `docs/patch_notes/patch_note_V0_8.md`.
- **Correctif précédent :** **v0.8.5 — audit complet + remédiation** : rapport d'audit professionnel
  (`docs/audit/2026-07-01-audit.md`) puis exécution de 3 plans
  (`docs/plans/2026-07-02-audit-remediation-{1-security,2-quality,3-ux}.md`) —
  Caddy bloque `/api/internal/*`, **CSP/Permissions-Policy** au proxy, **RBAC câblé partout**
  (pages + 85 actions, module `tasks`), IP de confiance `X-Real-IP` (XFF spoofable corrigé),
  éviction rate-limiter, comparaisons constant-time, purge LoginAttempt 90 j,
  `services/converter` mort supprimé + Flask durci, `estimateTokens`/helpers/routes DRY,
  Zod chat + `/ai`, **404/500 à la DA**, créneaux groupés par jour (+ durée) au chat **et** sur
  `/contact` (vraies dispos), **chat bilingue** (catalogues next-intl), live region + « Friday
  écrit… », onglet Annulés BO, tokens DA dans le SVG Cap. Gate : 399 unit + 23/23 E2E verts.
  Détail : `docs/patch_notes/patch_note_V0_8.md`.
- **Correctif précédent :** **v0.8.4 — réservation de créneaux par Friday** (booking bout-en-bout).
- **Dernier jalon livré :** **v0.8.0 — CV dynamique** (corpus BO → home + `/cv` + PDF A4 bilingue).
- **Prochain plan :** reliquats P2/P3 de l'audit (voir `TASKS.md`).

## Où on en est
- **Audit v0.8.5 livré** : constats P1 tous corrigés ; reliquats P2/P3 tracés dans `TASKS.md`.
- **BO v2** : phases P0→P17 livrées ; RBAC **enforcement** fait, reste l'outillage multi-comptes
  (nav filtrée, `/utilisateurs`, invitations, zxcvbn) — DT8 réduit.
- Environnement local : containers `web`/`admin` **rebuildés** sur le code v0.8.5 ;
  `image-processor` rebuildé (durci). Stack complète up.
- Doc d'archi projet (`.claude/CLAUDE.md`) : la table services parle encore de « converter »
  (réel : `image-processor`, + `cv-renderer`, + one-shots `migrate`/`minio-init`) — à rafraîchir
  (fichier d'instructions, non modifié cette nuit).

## Décisions verrouillées
1. **Mail** = Microsoft Graph (intégration existante).
2. **Boîte de réception unique = Mails + Messages** ; **RDV à part**.
3. **CRM complet** (Contacts + Sociétés + Deals/pipeline + activités/relances).
4. Conversion d'images : **image-processor (Flask) conservé et durci** ; l'alternative sharp
   (ex-`services/converter`) est supprimée du repo (option consignée dans l'audit §P2-3).
5. i18n : **catalogues next-intl = chrome + widget** ; libellés éditoriaux colocalisés (LABELS)
   conservés pour les projections type `public-cv`.

## Prochaine action
- Revue humaine de la PR `llm → dev` v0.8.5 (audit + remédiation) si non mergée automatiquement,
  puis reliquats P2/P3 (`TASKS.md`).
- DT8 restant (outillage multi-comptes) quand souhaité.

## Garde-fous (rappel)
- Travail sur `llm`, PR `llm → dev`. Jamais de push direct `dev`/`main`.
- Sécurité d'abord : Zod aux frontières, rôles DB, RBAC pages+actions, pas de secret en dur.
- Fichiers non commités volontairement laissés dans l'arbre : `.claude/settings.json` (local),
  `.gitignore` (+ ignore `docker-compose.override.yml`, décision de tracking à valider),
  `screenshots/`, `.playwright-mcp/` (artefacts de validation).
