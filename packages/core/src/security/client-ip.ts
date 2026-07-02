/**
 * Trusted client IP resolution for rate-limiting and audit logging.
 *
 * In production Caddy OVERWRITES `X-Real-IP` with the connecting socket
 * address (`header_up X-Real-IP {client_ip}`), so that value cannot be spoofed
 * by the visitor. `X-Forwarded-For` is only a dev fallback (no proxy): behind a
 * proxy that APPENDS to the incoming header, its first hop is attacker-chosen.
 *
 * @param headers - The incoming request headers.
 * @returns The client IP, or `"unknown"` when none can be determined.
 */
export function clientIpFromHeaders(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
