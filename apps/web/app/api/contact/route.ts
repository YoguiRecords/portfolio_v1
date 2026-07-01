import { prisma } from "@portfolio/db";
import { ContactInput, allow, clientIpFromHeaders } from "@portfolio/core";
import { isHoneypotHit, readJsonBody } from "../../../lib/http/public-request";
import { persistContact } from "../../../lib/contact/submit";

const RATE = { max: 5, windowMs: 60 * 60 * 1000 }; // 5 / hour / IP

/**
 * Public contact endpoint. Guards keep the DB untouched on rejection:
 * rate-limit → JSON parse → honeypot → Zod. Stored insert-only (BO inbox).
 * Responses: 201 ok · 400 invalid · 429 rate-limited · 200 silent (honeypot).
 */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);
  if (!allow(`contact:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: silently accept bots without persisting anything.
  if (isHoneypotHit(body)) {
    return Response.json({ ok: true });
  }

  const parsed = ContactInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  await persistContact(prisma, parsed.data, {
    ip,
    userAgent: request.headers.get("user-agent"),
  });
  return Response.json({ ok: true }, { status: 201 });
}
