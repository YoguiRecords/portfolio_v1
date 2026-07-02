import { allow, BookingInput, clientIpFromHeaders } from "@portfolio/core";
import { isHoneypotHit, readJsonBody } from "../../../lib/http/public-request";
import { submitBooking } from "../../../lib/booking/admin-client";

export const dynamic = "force-dynamic";

const RATE = { max: 5, windowMs: 60 * 60 * 1000 }; // 5 / hour / IP

/**
 * Public chatbot booking endpoint. Honeypot + rate-limit + Zod shape check, then
 * forwards to the admin internal route (atomic slot check + PENDING create +
 * email). Responses mirror admin: 201 ok · 400 invalid · 409 slot taken.
 */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);
  if (!allow(`booking:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: silently accept bots without persisting anything.
  if (isHoneypotHit(body)) {
    return Response.json({ ok: true }, { status: 201 });
  }

  const parsed = BookingInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const { status } = await submitBooking({
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    reason: parsed.data.reason,
    requestedAt: parsed.data.requestedAt.toISOString(),
  });

  if (status === 201) return Response.json({ ok: true }, { status: 201 });
  if (status === 409) return Response.json({ error: "slot_taken" }, { status: 409 });
  return Response.json({ error: "unavailable" }, { status: 502 });
}
