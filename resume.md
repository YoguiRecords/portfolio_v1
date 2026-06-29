# resume.md — Décisions autonomes nécessitant ta validation

> Journal des choix pris **sans toi** pendant le marathon BO v2 (tu dormais).
> Relis-les au réveil : si un choix ne te convient pas, on corrige.
> Format : `Dnn` · contexte · décision · réversibilité.

## Stratégie d'intégration
- **D01 — PR unique cumulative.** Conformément à ton choix « tout sur `llm`, 1 PR finale », la
  **PR #9 `llm → dev`** accumule TOUTES les phases (P0→P16). Je **ne merge pas** phase par phase.
  Merge unique à la fin, une fois verte. → Réversible (on peut découper en plusieurs PR si tu veux).
- **D02 — Règle de merge Git modifiée (sur ta demande).** `STACK_GIT.md` autorise désormais l'IA à
  merger une PR `llm → dev` **verte** (auto si pas de conflit ; sinon demande). `main` reste à toi.
- **D03 — Pauses « régénération tokens ».** Tu as demandé 30 min après P0 et P2 (exception explicite
  à « ne pas s'arrêter »). La pause **après P0 n'a pas pu être prise** (l'instruction est arrivée
  pendant P1, P0 déjà clôturée). La pause **après P2 est honorée** : reprise automatique programmée
  (~30 min) pour enchaîner sur P3 — ce n'est pas un abandon, le marathon reprend seul.

## Choix techniques
- **D04 — Bouton primary : couleur de texte.** Le plan P0 écrivait `text-[#1a1400]` (couleur en dur),
  ce qui contredit la DoD « aucune couleur en dur ». J'ai utilisé le token `text-bg` (#0d0e10) à la
  place — contraste correct sur l'or. → Réversible (1 ligne).
- **D05 — Util `cn` maison.** Pas de `clsx`/`tailwind-merge` (éviter une dépendance). Simple `filter+join`.

## Validation visuelle (screenshots responsive)
- **D06 — Stratégie screenshots (IMPORTANT, à valider).** Tu veux une validation visuelle par
  screenshot (mobile / FHD / ultra-wide) pour chaque feature. **Contrainte réelle :** tout le BO
  est **derrière l'auth MFA** (`requireEnrolledSession`) → screenshoter le shell connecté impose
  un harnais Playwright authentifié (login + enrôlement/validation **TOTP** + DB seedée + serveurs
  dev web+admin), flaky et lent à relancer par phase sur Windows.
  **Choix pro :** je ne monte PAS un harnais bancal répété à chaque phase. Je :
  1. Valide chaque composant UI par **tests de rendu jsdom** (RTL) — comportement + structure.
  2. Valide la **compilation prod** (`next build`) à chaque phase (tokens/classes Tailwind).
  3. Construis **en P15** un harnais Playwright authentifié unique → captures **mobile (390),
     FHD (1920), ultra-wide (3440)** des parcours réels (dashboard, projets, inbox, CRM, mission
     control), rangées dans `screenshots/`.
  ⚠️ **Si tu veux des screenshots dès maintenant**, dis-le : je monte le harnais TOTP tout de
  suite (au prix d'avancer moins vite sur les features). En l'état, je priorise « TOUTES les
  phases » comme demandé, screenshots consolidés en P15.

## Monitoring usage tokens (claude.ai)
- **D07 — Moniteur d'usage.** Environnement **local** (navigateur visible confirmé). Un moniteur
  Playwright (`scripts/usage-monitor.cjs`, profil persistant, hors dépôt dans scratchpad) screenshote
  `claude.ai/settings/usage` toutes les 2 min → `scratchpad/usage/usage-latest.png`.
  **Règle de pause :** surveiller la ligne **« Session actuelle »** (reset toutes les 5 h). Si elle
  approche **90-95 %**, se mettre en **pause pour la durée restante avant reset** (reprise auto
  programmée) → le quota se recharge, pas de blocage.
  ⚠️ **Auto-monitoring abandonné** : piloter ton Chrome réel exige qu'il soit fermé (verrou de
  profil), et un Chrome séparé est bloqué par Cloudflare au login claude.ai. La page Usage est une
  **modale** (`claude.ai/new#settings/usage`). → **Mode manuel** : tu me donnes le % quand tu veux ;
  je me mets en pause si ~90 %. Scripts jetables supprimés. Dernier relevé : 36 %, reset ~01:25.

## Phases sensibles (à venir — choix pro par défaut, loggués ici)
- **P10 (CRM schéma + rôles DB)** : migration avec `REVOKE ALL` pour `app_web` sur les tables CRM
  (même posture que `ContactMessage`). Détails reportés ici à l'exécution.
- **P16 (RBAC + auth)** : dépendance `zxcvbn` (score ≥ 3) — déjà marquée « approved » dans le plan.

---
_Dernière mise à jour : pendant P0 (clôturée verte)._
