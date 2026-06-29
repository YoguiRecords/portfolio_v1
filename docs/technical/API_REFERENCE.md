# API_REFERENCE

Points d'accès du site public (`apps/web`) et Server Actions du back office (`apps/admin`).
Toutes les entrées externes sont validées par Zod ; toutes les mutations Server Actions bénéficient
de la protection CSRF native de Next.

## Authentification

### `loginAction(prev, formData) → { error? }`
Premier facteur. Valide `email` / `password` (Zod), vérifie le mot de passe (argon2id).
- Échec → message **générique** `Identifiants invalides.` (anti-énumération).
- Rate-limit par IP et lockout de compte appliqués ; chaque tentative est auditée.
- Succès + TOTP activé → session `mfaPending`, redirection `/login/verify`.
- Succès + TOTP non activé → session active, redirection `/` (enrôlement forcé par les gardes).

### `verifyTotpAction(prev, formData) → { error? }`
Second facteur. Requiert une session `mfaPending`. Valide le code à 6 chiffres (Zod) et le
vérifie (TOTP). Succès → session promue (`mfaPending=false`), redirection `/`. Échec → `Code invalide.`
(audité, compte le lockout).

### `confirmTotpEnrolmentAction(prev, formData) → { error? }`
Enrôlement TOTP. Requiert une session active. Vérifie le code contre le secret proposé
(champ `secret`) ; succès → secret persisté + `isTotpEnabled=true`, redirection `/`.

### `logoutAction() → void`
Révoque la session (suppression serveur + cookie effacé), redirection `/login`.

## Gardes serveur (`lib/auth/guards.ts`)
- `requireActiveSession()` — session pleinement authentifiée (sinon `/login` ou `/login/verify`).
- `requireEnrolledSession()` — session active **et** TOTP enrôlé (sinon `/security/totp`).

## Proxy (`apps/admin/proxy.ts`)
Garde grossière : redirige vers `/login` toute requête sans cookie de session sur une route
protégée. La validité réelle de la session est vérifiée côté serveur dans les pages.

## Modèle de session
Token opaque aléatoire (256 bits) posé en cookie `httpOnly` / `SameSite=Lax` / `Secure` (prod),
durée 8 h. Seul le hash SHA-256 du token est stocké (`Session.tokenHash`).

---

## Route Handlers publics (`apps/web`)
Tous : validation Zod + honeypot + rate-limit par IP. Réponses : `201` ok · `400` invalide ·
`429` rate-limité · `200` silencieux (honeypot). **Écriture seule** (aucune lecture de PII).

- `POST /api/contact` → crée un `ContactMessage` (inbox BO).
- `POST /api/appointments` → crée un `AppointmentRequest` (`source=CONTACT`, `status=PENDING`).
- `POST /api/testimonials` → crée un `Testimonial` (`status=PENDING`, modéré au BO).
- `POST /api/chat` → chatbot public (**désactivé par défaut** via `AiAssistantConfig` + clé OpenRouter).
  Rate-limit ; contexte **public uniquement** + prompt à garde-fous ; `404` si désactivé.

### SEO / découvrabilité (`apps/web`)
- `GET /sitemap.xml` — contenu publié, 2 locales (hreflang). `GET /robots.txt` — politique crawlers
  IA selon `SiteSettings.allowAiCrawlers`. `GET /llms.txt` — présentation IA (`text/plain`).

## Cron (publication programmée)
- `POST /api/cron/publish` (`apps/admin`) — protégé par `Authorization: Bearer <CRON_SECRET>`
  (`401` sinon). Bascule les `Article`/`Event` `SCHEDULED` échus en `PUBLISHED` (rôle `app_admin`).

## Server Actions back office (`apps/admin`, rôle `app_admin`, garde MFA)
Chaque action : `requireEnrolledSession()` → validation Zod → mutation → `revalidatePath`.
- **Contenu home** : `createKpiAction` / `updateKpiAction` / `deleteKpiAction`, `upsertProfileAction`.
- **Projets** : `createProjectAction` / `setProjectStatusAction` / `deleteProjectAction` ;
  actions de blocs (ajout/maj validée Zod par type/réordo/visibilité/suppression).
- **Articles** : `createArticleAction` / `deleteArticleAction` (programmation `SCHEDULED`).
- **Médias** : `uploadImageAction` (pipeline validate → image-processor → MinIO → `MediaAsset`).
- **Agenda** : `createEventAction` / `deleteEventAction` / `generateNewsAction` (actu depuis évènement).
- **Modération** : `approveTestimonialAction` / `rejectTestimonialAction` / `editTestimonialAction`
  (édite le texte affiché, jamais l'original d'audit) ; inbox `markMessageReadAction` /
  `markMessageSpamAction` ; RDV `confirmAppointmentAction` / `declineAppointmentAction`.
- **IA** : `assistFieldAction(action, text)` (assistance par champ ; budget tokens ; OpenRouter).
