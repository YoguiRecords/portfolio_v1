import { allow, clientIpFromHeaders } from "@portfolio/core";
import { readJsonBody } from "../../../../lib/http/public-request";
import { submitCancel } from "../../../../lib/booking/admin-client";

export const dynamic = "force-dynamic";

const RATE = { max: 20, windowMs: 60 * 60 * 1000 }; // 20 / hour / IP

/**
 * Public self-service cancellation endpoint. Forwards the token to the admin
 * internal route. Always returns a generic `{ ok }` — never reveals whether the
 * token matched (no enumeration).
 */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);
  if (!allow(`booking-cancel:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const token = (body as { token?: unknown })?.token;
  if (typeof token !== "string" || !token) return Response.json({ ok: false }, { status: 400 });

  const result = await submitCancel(token);
  return Response.json(result);
}
