/**
 * Shared guards for the public route handlers (contact, testimonials, chat,
 * booking…). Keeps every endpoint on the same request-hygiene sequence:
 * rate-limit (caller) → JSON parse → honeypot → Zod (caller).
 */

/**
 * Parses the request body as JSON.
 *
 * @returns The parsed value, or `null` when the body is not valid JSON.
 */
export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * Detects the anti-bot honeypot: a hidden `website` field that real users
 * never fill. Callers answer a silent success so bots learn nothing.
 */
export function isHoneypotHit(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    Boolean((body as { website: unknown }).website)
  );
}
