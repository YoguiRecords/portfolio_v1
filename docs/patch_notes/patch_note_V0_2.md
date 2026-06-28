# Patch notes — v0.2.x

## v0.2.0 — Authentification back office (2026-06-28)

Authentification durcie du back office (`apps/admin`) : compte admin unique, sessions opaques,
MFA TOTP obligatoire et défenses anti brute-force. Aucune dépendance de crypto maison —
orchestration de libs éprouvées.

### Base de données
- Nouveaux modèles : `AdminUser` (hash argon2id, secret TOTP, compteurs de lockout),
  `Session` (token opaque, seul le hash SHA-256 est stocké, drapeau `mfaPending`),
  `LoginAttempt` (audit des tentatives).
- **Isolation** : les tables d'auth sont `REVOKE`d pour le rôle `app_web` (lecture seule public)
  via la migration → une compromission du site public n'expose pas les secrets admin.
- Seed idempotent du compte admin (`pnpm --filter @portfolio/db db:seed`, identifiants par env).

### Authentification (`apps/admin`)
- Login mot de passe (argon2id) → **vérification TOTP obligatoire** (enrôlement par QR code,
  secret persisté uniquement après preuve d'un code valide).
- Sessions opaques en cookie `httpOnly` / `SameSite=Lax` / `Secure` (prod), durée 8 h.
- `proxy` (Next) : garde grossière sur la présence du cookie ; validation réelle côté serveur.
- Protection CSRF via les Server Actions (vérification d'origine native) + `SameSite`.

### Anti brute-force
- Lockout de compte après 5 échecs consécutifs (15 min), compteurs sur `AdminUser`.
- Rate-limit par IP (fenêtre glissante 15 min) sur les échecs.
- Audit de chaque tentative (`LoginAttempt`). Messages d'erreur **génériques** (anti-énumération),
  mitigation de timing (hash factice quand l'email est inconnu).

### Tests
- Vitest : 22 tests sur les garde-fous (argon2, token, TOTP, schémas Zod, politique de lockout).
- Parcours complets vérifiés de bout en bout (login + MFA + enrôlement + lockout).

### Dépendances ajoutées
- `@node-rs/argon2`, `otplib`, `qrcode`, `zod` (runtime) ; `vitest`, `tsx` (outillage).
