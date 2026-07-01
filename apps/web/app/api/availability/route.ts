import { allow, clientIpFromHeaders } from "@portfolio/core";
import { fetchFreeSlots } from "../../../lib/booking/admin-client";

export const dynamic = "force-dynamic";

const RATE = { max: 30, windowMs: 10 * 60 * 1000 }; // 30 / 10 min / IP
const DEFAULT_HORIZON_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Public availability endpoint. Proxies the admin internal availability route
 * (which owns the private calendar) and returns only free slot starts (ISO, no
 * PII). Rate-limited per IP.
 */
export async function GET(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);
  if (!allow(`availability:${ip}`, RATE)) {
    return new Response("Too Many Requests", { status: 429 });
  }

  const now = new Date();
  const from = now.toISOString();
  const to = new Date(now.getTime() + DEFAULT_HORIZON_MS).toISOString();
  const slots = await fetchFreeSlots(from, to);
  return Response.json({ slots });
}
