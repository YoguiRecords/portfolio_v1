import { prisma } from "@portfolio/db";
import { AppointmentInput, allow } from "@portfolio/core";
import { persistAppointment } from "../../../lib/contact/submit";

const RATE = { max: 5, windowMs: 60 * 60 * 1000 }; // 5 / hour / IP

function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/**
 * Public appointment-request endpoint. Same guard order as contact; stored as
 * a PENDING request (source CONTACT), confirmed later in the BO.
 * Responses: 201 ok · 400 invalid · 429 rate-limited · 200 silent (honeypot).
 */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request);
  if (!allow(`appointment:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body && typeof body === "object" && "website" in body && (body as { website: unknown }).website) {
    return Response.json({ ok: true });
  }

  const parsed = AppointmentInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  await persistAppointment(prisma, parsed.data, {
    ip,
    userAgent: request.headers.get("user-agent"),
  });
  return Response.json({ ok: true }, { status: 201 });
}
