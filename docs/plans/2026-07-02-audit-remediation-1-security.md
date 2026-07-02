# Audit Remediation 1 — Sécurité Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fermer les constats sécurité P1/P2/P3 de l'audit `docs/audit/2026-07-01-audit.md`
(Caddy `/api/internal`, CSP, RBAC DT8, IP de confiance, rate-limiter, comparaisons de secrets,
token en query, purge LoginAttempt).

**Architecture:** Durcissement en couches : proxy (Caddyfile) d'abord, puis gardes applicatives
(RBAC par page + action), puis primitives partagées dans `@portfolio/core` (IP de confiance,
éviction du rate-limiter, comparaison constant-time). Aucun nouveau service, aucune nouvelle
dépendance.

**Tech Stack:** Caddy 2, Next.js 16 (App Router, Server Actions), Zod, Vitest, Prisma.

---

### Task 1: Caddyfile — bloquer `/api/internal/*` sur l'hôte admin (P1-3)

**Files:**
- Modify: `proxy/Caddyfile` (bloc `{$ADMIN_SITE…}`)

**Step 1: Étendre le handle interne**

```caddyfile
	# Surfaces internes (cv-renderer, API booking web→admin) : jamais via le proxy.
	handle /internal/* {
		respond 404
	}
	handle /api/internal/* {
		respond 404
	}
```

**Step 2: Recharger le proxy et vérifier**

Run: `docker compose restart proxy`
Puis: `curl -s -o /dev/null -w "%{http_code}" -H "Host: bo.yohan-debusscher.com" http://localhost:8090/api/internal/availability`
Expected: `404` (avant le fix : 401 renvoyé par l'app → preuve que la requête l'atteignait).
Contrôle non-régression: `curl … http://localhost:8090/login` → `200`.

**Step 3: Corriger le commentaire mensonger + doc**

- `apps/admin/lib/internal/guard.ts` : le commentaire « never exposed through the proxy »
  devient exact — le laisser mais préciser « bloquées par Caddy (handle 404) ».
- `docs/technical/SECURITY.md` : section booking — ajouter que Caddy bloque `/api/internal/*`.

**Step 4: Commit**

```bash
git add proxy/Caddyfile apps/admin/lib/internal/guard.ts docs/technical/SECURITY.md
git commit -m "fix(proxy): block /api/internal/* on the admin host (defence in depth)"
```

---

### Task 2: Caddyfile — CSP + Permissions-Policy par hôte (P1-2)

**Files:**
- Modify: `proxy/Caddyfile`

**Step 1: Ajouter les en-têtes**

Le snippet commun gagne `Permissions-Policy`. La CSP diffère par hôte (Umami a besoin de
son script sur `web` ; `unsafe-inline` requis par les scripts inline de Next — pas de nonce
sans middleware dédié, YAGNI ici) :

```caddyfile
(security_headers) {
	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains"
		X-Content-Type-Options nosniff
		X-Frame-Options DENY
		Referrer-Policy strict-origin-when-cross-origin
		Permissions-Policy "camera=(), microphone=(), geolocation=()"
		-Server
	}
}
```

Dans le bloc **web** :

```caddyfile
	header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' {$STATS_SITE:http://stats.yohan-debusscher.com}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: {$MEDIA_ORIGIN:*}; font-src 'self' data:; connect-src 'self' {$STATS_SITE:http://stats.yohan-debusscher.com}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

Dans le bloc **admin** (iframe srcdoc du CV → `frame-src 'self'` suffit, images MinIO/Graph) :

```caddyfile
	header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: {$MEDIA_ORIGIN:*}; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
```

Note : `{$MEDIA_ORIGIN}` = origine publique des médias (dev `http://localhost:9100`,
prod le domaine lui-même car `/media/*` est même origine) — ajouter la variable d'env au
service proxy dans `docker-compose.yml` (défaut `*` acceptable en dev seulement, mettre le
vrai domaine en prod).

**Step 2: Vérifier en navigateur réel (MCP Playwright)**

- Recharger le proxy, ouvrir `http://localhost:8090` (Host web) : home fonctionnelle,
  chat OK, **0 erreur CSP** en console.
- Hôte admin : login + dashboard + page CV (iframe) sans erreur CSP.
- Ajuster la CSP si la console révèle un blocage légitime (la corriger, pas l'élargir en `*`).

**Step 3: Doc + commit**

`docs/technical/SECURITY.md` (posture en-têtes) puis :

```bash
git add proxy/Caddyfile docker-compose.yml docs/technical/SECURITY.md
git commit -m "feat(proxy): CSP + Permissions-Policy per host"
```

---

### Task 3: IP client de confiance (P2-1) + éviction rate-limiter (P2-2)

**Files:**
- Create: `packages/core/src/security/client-ip.ts` + `client-ip.test.ts`
- Modify: `packages/core/src/security/rate-limit.ts` + `rate-limit.test.ts`
- Modify: `packages/core/src/index.ts` (exports)
- Modify: `proxy/Caddyfile` (poser `X-Real-IP`)
- Modify: les 6 routes web (`contact`, `chat`, `booking`, `booking/cancel`, `appointments`,
  `availability`) + `apps/admin/lib/auth/throttle-policy.ts` (`parseClientIp`)

**Step 1: Test du helper (failing)**

```ts
// packages/core/src/security/client-ip.test.ts — AAA
import { clientIpFromHeaders } from "./client-ip";

test("privilégie X-Real-IP (posé par le proxy, non spoofable)", () => {
  const h = new Headers({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "6.6.6.6, 203.0.113.9" });
  expect(clientIpFromHeaders(h)).toBe("203.0.113.9");
});
test("fallback dev : premier X-Forwarded-For", () => {
  const h = new Headers({ "x-forwarded-for": "192.0.2.1" });
  expect(clientIpFromHeaders(h)).toBe("192.0.2.1");
});
test("aucun header → unknown", () => {
  expect(clientIpFromHeaders(new Headers())).toBe("unknown");
});
```

**Step 2: Implémentation**

```ts
/**
 * Trusted client IP. In production Caddy OVERWRITES `X-Real-IP` with the socket
 * address, so it cannot be spoofed; `X-Forwarded-For` is only a dev fallback
 * (its first hop is attacker-controlled behind a proxy that appends).
 */
export function clientIpFromHeaders(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
```

**Step 3: Caddyfile — poser le header sur web ET admin**

```caddyfile
	handle {
		reverse_proxy web:3100 {
			header_up X-Real-IP {client_ip}
		}
	}
```
(idem `admin:3101`.)

**Step 4: Brancher partout**

- Les 6 routes web : supprimer le `clientIp()` local, importer
  `clientIpFromHeaders(request.headers)` (`@portfolio/core`).
- `throttle-policy.ts` : `parseClientIp` délègue au helper (signature conservée ou adaptée
  aux appels de `auth/actions.ts` — 2 sites).

**Step 5: Éviction du rate-limiter (test d'abord)**

```ts
test("les buckets vides sont purgés (pas de fuite mémoire)", () => {
  allow("k1", { max: 1, windowMs: 10 }, 0);
  allow("k2", { max: 1, windowMs: 10 }, 1000); // k1 expiré → purgé au passage
  expect(rateLimitSize()).toBe(1);
});
```

Implémentation : dans `allow()`, `store.delete(key)` quand le tableau filtré est vide ;
balayage opportuniste global quand `store.size > 10_000` (borne anti-abus) ; exporter
`rateLimitSize()` (test seulement).

**Step 6: Vérifier & committer**

Run: `pnpm --filter @portfolio/core test && pnpm --filter web test && pnpm --filter admin test && pnpm -r typecheck`
Expected: verts.

```bash
git commit -m "fix(security): trusted client IP via proxy-set X-Real-IP + rate-limiter eviction"
```

---

### Task 4: RBAC — câbler `requirePermission` sur pages et actions (P1-1 / DT8)

**Files:**
- Modify: ~30 pages `apps/admin/app/(dashboard)/**/page.tsx`
- Modify: tous les fichiers `apps/admin/lib/actions/*.ts` + `lib/auth/totp-actions.ts`
- Test: `packages/core/src/auth/permissions.test.ts` (mapping), e2e existant `e2e/bo-v2.spec.ts`

**Step 1: Relire le contrat**

Lire `packages/core/src/auth/permissions.ts` : `BO_MODULES`, `can()`. Établir le mapping
page/action → module (ex. `projets`→`projects`, `articles`→`articles`, `media`→`media`,
`contacts|societes|pipeline|taches`→`crm`, `inbox|mails|messages`→`inbox`, `rdv|agenda|calendrier`→`agenda`,
`content|profile|cv|competences|experiences|formations|langues|interets|parcours|analyses|faq`→`content`,
`reglages|ai`→`settings`, `temoignages`→`testimonials`, dashboard/mission-control→`dashboard`).
**Adapter aux noms réels de `BO_MODULES`** — si un module manque, l'ajouter à la constante
(+ test core).

**Step 2: Pages (mécanique, par lots de ~8)**

Dans chaque `page.tsx` : remplacer l'éventuel accès direct par
`await requirePermission("<module>")` en tête (le layout garde `requireEnrolledSession`
comme filet). Lot par lot : `pnpm --filter admin typecheck` puis commit
`feat(admin): wire RBAC guards on <group> pages`.

**Step 3: Actions**

Dans chaque Server Action mutante : `const session = await requirePermission("<module>");`
suivi de `assertCanWrite(session);` (remplace `requireEnrolledSession`).
Les actions de lecture pure gardent `requirePermission` seul.

**Step 4: Vérification**

- `pnpm --filter admin test && pnpm --filter admin typecheck && pnpm --filter admin lint`
- Navigateur (MCP) : parcours BO normal (OWNER) — dashboard, projets, une édition, tâches
  drag&drop — rien de cassé.
- `pnpm test:e2e -- e2e/bo-v2.spec.ts` (guards).

**Step 5: Doc + commit final**

`docs/technical/SECURITY.md` (RBAC effectif) ;
`git commit -m "feat(admin): enforce RBAC on every BO page and mutating action (DT8)"`

---

### Task 5: Finitions sécurité (P3-1, P3-2, P3-3)

**Files:**
- Create: `packages/core/src/security/constant-time.ts` + test
- Modify: `apps/admin/lib/internal/guard.ts` (+ test existant), `apps/admin/app/api/cron/publish/route.ts`,
  `apps/admin/app/internal/cv-document/page.tsx`, `apps/admin/lib/auth/throttle.ts` (+ test)

**Step 1: Helper constant-time (test d'abord)**

```ts
import { timingSafeEqual } from "node:crypto";
/** Constant-time string equality (secret comparison). */
export function secretEquals(a: string, b: string): boolean {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
```

Brancher dans `isInternalAuthorized`, le check `Bearer` du cron, le check `x-cv-token`.

**Step 2: `cv-document` — supprimer le fallback query param**

`page.tsx` : ne lire que le header `x-cv-token` (le renderer n'utilise que le header — vérifié).
Garder l'ouverture dev quand `CV_RENDER_TOKEN` est absent hors prod.

**Step 3: Purge LoginAttempt (test d'abord)**

Dans `resetAccountFailures` (appelée à chaque login réussi) ou fonction dédiée appelée par
`recordAttempt` succès : `prisma.loginAttempt.deleteMany({ where: { createdAt: { lt: J-90 } } })`.
Test : insère un attempt daté de 100 j (test DB), succès → purgé.

**Step 4: Gate + commit**

Run: `pnpm --filter @portfolio/core test && pnpm --filter admin test && pnpm -r typecheck && pnpm -r lint`

```bash
git commit -m "fix(security): constant-time secret compares, header-only cv token, LoginAttempt retention"
```
