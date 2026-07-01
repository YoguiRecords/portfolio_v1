/**
 * Shared-secret guard for internal admin routes called by the public web app
 * (availability / booking / cancellation) over the Docker `internal` network.
 * Caddy blocks `/api/internal/*` on the admin host (respond 404); the token is
 * a defence in depth against any accidental exposure. Fails closed when the
 * env is unset.
 */
export function isInternalAuthorized(request: Request): boolean {
  const expected = process.env.APPOINTMENTS_INTERNAL_TOKEN;
  if (!expected) return false; // fail closed: no token configured → deny
  const got = request.headers.get("x-internal-token");
  return typeof got === "string" && got.length > 0 && got === expected;
}
