# API_REFERENCE

Server Actions et points d'accès du back office (`apps/admin`). Toutes les entrées externes
sont validées par Zod ; toutes les mutations bénéficient de la protection CSRF native des
Server Actions.

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
