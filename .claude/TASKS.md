# TASKS — Portfolio (backlog à faire uniquement)

> Backlog actionnable. Retirer chaque tâche dès qu'elle est livrée (pas d'historique ici).

## Plans restants (ordre d'exécution)
- [x] **P3** — Web : fiches projet (blocs modulaires, 12 types Zod) → `/projets/[slug]`. ✅
- [x] **P4** — Web : News/Articles + Agenda/Événements (+ cron de publication programmée). ✅ (FR ; i18n → Pi18n)
- [x] **Pi18n** — Bilingue (FR/EN), routes `[locale]`, overlay `Translation` + traduction IA, `LocalizedField`. ✅
      (Reste : câbler `localize()` dans les loaders projet/news/agenda/témoignages — mécanique.)
- [x] **P5** — Web : Témoignages (affichage approuvés + formulaire de soumission modérée). ✅
- [x] **P6** — Web : Contact + demande de RDV (endpoints insert-only, Zod, rate-limit, honeypot) + page. ✅
- [x] **P7** — Web : SEO/AEO (JSON-LD Person/CreativeWork/FAQ, metadata+hreflang, sitemap, robots, llms.txt). ✅
- [x] **P8** — Admin : shell BO (`(dashboard)` gardé, AdminNav/AdminLayout, dashboard stats). ✅
- [~] **P9** — Admin : CRUD contenu home — **pattern réutilisable** (schémas Zod + Server Actions `app_admin`
      + persistance testée) + éditeurs **KPI** et **Profil**. Reste : écrans SiteSettings/HomeSection/Skill/
      Career*/Analysis/Goal (même pattern) + E2E BO-login (TOTP).
- [x] **P10** — Admin : CRUD projet + actions de blocs (Zod par type, symétrique du renderer). ✅
- [x] **P11** — Admin : CRUD article (programmation) + pipeline upload sécurisé (image-processor→MinIO) + vidéo/embed. ✅
- [x] **P12** — Admin : CRUD agenda + génération dactu depuis évènement. ✅
- [x] **P13** — Admin : modération témoignages + inbox contact + RDV. ✅
- [x] **P14** — IA : adaptateur OpenRouter + assistance par champ (5 actions) + budget + AiAssistantConfig + action/page BO. ✅
- [x] **P15** — IA : chatbot public (contexte public-only, garde-fous, booking tool, /api/chat désactivé par défaut) + widget. ✅
- [x] **P16** — Réseaux : **plan documenté uniquement** (non exécuté, comme prévu). ✅

## Infra / cleanup
- [ ] Retirer le service Node `services/converter/` (remplacé par `image-processor` réutilisé d'OXO).
- [ ] **image-processor** : warning `Permission denied: '/home/appuser'` au boot (gunicorn, `$HOME` absent) — healthy malgré tout, à corriger (`ENV HOME=/tmp` ou créer/chown le home).
- [ ] MinIO : clé d'écriture serveur à privilège minimal (vs root) pour le back office.
- [ ] Prod hardening : sortir `db` de `edge` + retirer port 5436 (override prod), épingler images par digest.
- [ ] Avatar : re-générer via `image-processor` (au lieu de sharp manuel) une fois P11 livré.

## Transverse
- [ ] Porter `AdminImageUploader` (Vue/OXO) → React (composant BO, P11). Voir `docs/plans/2026-06-29-Pconv-image-processor.md`.
- [ ] Docs à créer avec les features : `docs/technical/E2E_TESTING.md`.
- [ ] (Optionnel) Décider du passage TS 6 / ESLint 10 (gardés en 5/9 testés par Next 16).
