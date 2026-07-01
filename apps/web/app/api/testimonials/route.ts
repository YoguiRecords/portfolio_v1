import { prisma } from "@portfolio/db";
import { TestimonialInput, allow, clientIpFromHeaders } from "@portfolio/core";
import { persistTestimonial } from "../../../lib/testimonials/submit";

const RATE = { max: 3, windowMs: 60 * 60 * 1000 }; // 3 submissions / hour / IP

/** Extracts the caller IP from proxy headers (best-effort). */
function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots fill the hidden `website` field → accept silently, store nothing.
  if (body && typeof body === "object" && "website" in body && (body as { website: unknown }).website) {
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
