import { prisma } from "@portfolio/db";
import { TestimonialInput, allow, clientIpFromHeaders } from "@portfolio/core";
import { isHoneypotHit, readJsonBody } from "../../../lib/http/public-request";
import { persistTestimonial } from "../../../lib/testimonials/submit";

const RATE = { max: 3, windowMs: 60 * 60 * 1000 }; // 3 submissions / hour / IP

/**
 * Public testimonial submission endpoint.
 *
 * Order of guards keeps the DB untouched on rejection: rate-limit → JSON parse →
 * honeypot → Zod. A valid submission is stored as PENDING (moderated in the BO).
 * Responses: 201 ok · 400 invalid · 429 rate-limited · 200 silent (honeypot).
 */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);

  if (!allow(`testimonial:${ip}`, RATE)) {
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

  const parsed = TestimonialInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  await persistTestimonial(prisma, parsed.data, {
    ip,
    userAgent: request.headers.get("user-agent"),
  });
  return Response.json({ ok: true }, { status: 201 });
}
