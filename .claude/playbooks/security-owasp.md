## Universal Security Rules

Applied to ALL projects regardless of technology stack.

## OWASP Top 10 — Critical Rules

**A01 — Broken Access Control**
- Enforce authorization on every endpoint/function — never rely on client-side hiding.
- Default deny: access is forbidden unless explicitly granted.
- Users must not access resources belonging to other users — enforce ownership checks.
- FORBIDDEN: `[AllowAnonymous]` or equivalent at the class level — apply per-method with justification.
- FORBIDDEN: global auth disabled by default — use opt-out, not opt-in.

**A02 — Cryptographic Failures**
- HTTPS everywhere in production. No exceptions.
- Never store passwords in plain text — use bcrypt, argon2, or scrypt.
- Encrypt sensitive data at rest (PII, credentials, tokens).
- Never roll your own cryptography.
- Token/secret comparison → constant-time function ONLY (`CryptographicOperations.FixedTimeEquals`, `hmac.Equal`, `secrets.compare_digest`). NEVER string `==`.
- Blacklisted tokens → store the hash (SHA-256), not the raw token.

**A03 — Injection**
- Parameterized queries always — never string concatenation for SQL or commands.
- Validate and sanitize all external inputs (HTTP, files, environment variables, IPC).
- Treat all external data as untrusted.
- Shell command execution → NEVER interpolate user data into command strings. Use argument lists or dedicated APIs.
- File paths from user input → validate with `Path.GetFullPath()` + prefix check against the allowed base directory. `Path.Combine` is NOT sufficient (absolute paths bypass it).
- HTML injection → sanitize with DOMPurify or equivalent before injecting into the DOM. NEVER use `innerHTML` or `dangerouslySetInnerHTML` with unsanitized external content (includes SVG from rendering libraries like Mermaid).

**A04 — Insecure Design**
- Threat modeling before implementation of sensitive features.
- Defense in depth: multiple security controls, not a single point of trust.
- FORBIDDEN: environment variable fallback values for secrets (`?? "dev-key"` or `os.getenv("SECRET", "default")`). A missing secret must fail loudly at startup.

**A05 — Security Misconfiguration**
- No default credentials in production.
- Remove unused features, endpoints, and accounts.
- Error messages: never expose stack traces or internal details to clients. Log internally, return generic message.
- Security headers required: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options.

**A06 — Vulnerable Components**
- Pin all dependency versions. Audit with automated tools (npm audit, pip-audit, dotnet-outdated).
- Update dependencies regularly. No known CVEs with Critical or High severity.

**A07 — Authentication Failures**
- Brute-force protection: rate limiting on login, register, and password reset endpoints.
- Secure session management: HttpOnly, Secure, SameSite cookies.
- Multi-factor authentication for sensitive operations.

**A08 — Software and Data Integrity**
- Verify integrity of downloaded dependencies (checksums, signatures).
- No serialization of untrusted data without validation.

**A09 — Logging and Monitoring**
- Log security events: auth failures, access denials, input validation failures.
- FORBIDDEN: logging sensitive data (passwords, tokens, PII, full URLs containing credentials, git clone URLs with embedded tokens).
- Alerts on anomalous patterns.

**A10 — Server-Side Request Forgery**
- Validate and whitelist all URLs fetched server-side.
- Block internal network access from user-supplied URLs.

## WebSocket / Real-Time Security
- FORBIDDEN: `CheckOrigin` that always returns true — validate Origin against allowed hosts.
- Authenticate BEFORE upgrading the connection — verify JWT or session.
- FORBIDDEN: passing tokens in WebSocket query strings — exposed in server logs, proxies, and browser history. Use headers or cookie-based auth.
- Unvalidated CLI arguments, model names, or user-supplied strings passed to subprocess → injection risk. Whitelist allowed values.
- Environment variables from client → filter against a whitelist. NEVER pass arbitrary env vars (PATH, LD_PRELOAD injection).

## Secrets Management
- FORBIDDEN: secrets in source code, commits, or config files — including "dev-only" fallback values.
- Use environment variables injected at runtime or a secrets vault.
- Rotate compromised secrets immediately.
- Credentials, API keys, and debug data must NEVER be compiled into production bundles — use build-time guards that are tree-shaken.
