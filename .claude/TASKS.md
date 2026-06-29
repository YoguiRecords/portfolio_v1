# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Plans restants (ordre d'exécution)
- [x] **P3** — Web : fiches projet (blocs modulaires, 12 types Zod) → `/projets/[slug]`. ✅
- [x] **P4** — Web : News/Articles + Agenda/Événements (+ cron de publication programmée). ✅ (FR ; i18n → Pi18n)
- [x] **Pi18n** — Bilingue (FR/EN), routes `[locale]`, overlay `Translation` + traduction IA, `LocalizedField`. ✅
      (Reste : câbler `localize()` dans les loaders projet/news/agenda/témoignages — mécanique.)
- [x] **P5** — Web : Témoignages (affichage approuvés + formulaire de soumission modérée). ✅
- [x] **P6** — Web : Contact + demande de RDV (endpoints insert-only, Zod, rate-limit, honeypot) + page. ✅
- [ ] **P7** — Web : SEO/AEO (metadata, sitemap, robots, llms.txt, JSON-LD, FAQPage, OG).
- [ ] **P8** — Admin : garde des routes + shell BO (nav, layout).
- [ ] **P9** — Admin : CRUD contenu home (Profile, SiteSettings, HomeSection, KPI, Skill, Career*, Analysis, Goal).
- [ ] **P10** — Admin : Projets + éditeur de blocs.
- [ ] **P11** — Admin : Articles (+ programmation) + **upload média** (via `image-processor` → MinIO).
- [ ] **P12** — Admin : Agenda/Événements (+ génération d'actu depuis évènement).
- [ ] **P13** — Admin : Modération témoignages + inbox contact/RDV.
- [ ] **P14** — IA : assistant de rédaction d'actus au BO (OpenRouter).
- [ ] **P15** — IA : chatbot public + RDV + garde-fous (OpenRouter).
- [ ] **P16** — Réseaux : auto-post + stats (**plan only**, non exécuté).

## Infra / cleanup
- [ ] Retirer le service Node `services/converter/` (remplacé par `image-processor` réutilisé d'OXO).
- [ ] **minio-init** : diagnostiquer pourquoi le one-shot ne se lance pas (bucket `media` déjà public → non bloquant).
- [ ] MinIO : clé d'écriture serveur à privilège minimal (vs root) pour le back office.
- [ ] Prod hardening : sortir `db` de `edge` + retirer port 5436 (override prod), épingler images par digest.
- [ ] Avatar : re-générer via `image-processor` (au lieu de sharp manuel) une fois P11 livré.

## Transverse
- [ ] Porter `AdminImageUploader` (Vue/OXO) → React (composant BO, P11). Voir `docs/plans/2026-06-29-Pconv-image-processor.md`.
- [ ] Docs à créer avec les features : `docs/technical/E2E_TESTING.md`.
- [ ] (Optionnel) Décider du passage TS 6 / ESLint 10 (gardés en 5/9 testés par Next 16).
