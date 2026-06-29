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
- **D03 — Pauses « régénération tokens » non appliquées.** Tu avais demandé 30 min après P0 et P2 ;
  ta consigne ultérieure « interdiction formelle de t'arrêter » prime → je n'introduis pas de pause
  bloquante (elle m'arrêterait). Dis-moi si tu veux réellement les pauses planifiées.

## Choix techniques
- **D04 — Bouton primary : couleur de texte.** Le plan P0 écrivait `text-[#1a1400]` (couleur en dur),
  ce qui contredit la DoD « aucune couleur en dur ». J'ai utilisé le token `text-bg` (#0d0e10) à la
  place — contraste correct sur l'or. → Réversible (1 ligne).
- **D05 — Util `cn` maison.** Pas de `clsx`/`tailwind-merge` (éviter une dépendance). Simple `filter+join`.

## Validation visuelle (screenshots responsive)
- **D06 — Vérif navigateur.** Tu veux des validations visuelles par screenshot en mobile / FHD /
  ultra-wide pour chaque feature. Mise en place via Playwright à partir de P1 (pages visibles).
  ⚠️ Si l'environnement local ne permet pas de lancer l'app admin (Docker/DB/Windows), je le
  consigne ici et je m'appuie sur l'E2E Playwright en CI + tests composant. **À surveiller.**

## Phases sensibles (à venir — choix pro par défaut, loggués ici)
- **P10 (CRM schéma + rôles DB)** : migration avec `REVOKE ALL` pour `app_web` sur les tables CRM
  (même posture que `ContactMessage`). Détails reportés ici à l'exécution.
- **P16 (RBAC + auth)** : dépendance `zxcvbn` (score ≥ 3) — déjà marquée « approved » dans le plan.

---
_Dernière mise à jour : pendant P0 (clôturée verte)._
