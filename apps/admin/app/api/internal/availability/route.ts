import { prisma } from "@portfolio/db";
import { getCalendar } from "@/lib/integrations/factory";
import { isInternalAuthorized } from "@/lib/internal/guard";
import { listFreeSlots } from "@/lib/booking/availability-service";

export const dynamic = "force-dynamic";

const DEFAULT_HORIZON_MS = 14 * 24 * 60 * 60 * 1000;
const MAX_HORIZON_MS = 31 * 24 * 60 * 60 * 1000;

/**
 * Internal availability endpoint (web → admin over the Docker `internal`
 * network, token-guarded, never proxied). Returns free slot starts (ISO only,
 * no PII). Window defaults to now → +14 days, clamped to 31 days.
 */
export async function GET(request: Request): Promise<Response> {
  if (!isInternalAuthorized(request)) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const now = new Date();
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const from = fromParam ? new Date(fromParam) : now;
  let to = toParam ? new Date(toParam) : new Date(now.getTime() + DEFAULT_HORIZON_MS);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return Response.json({ error: "invalid_range" }, { status: 400 });
  }
  if (to.getTime() - from.getTime() > MAX_HORIZON_MS) {
    to = new Date(from.getTime() + MAX_HORIZON_MS);
  }

  const slots = await listFreeSlots(prisma, getCalendar(), from.toISOString(), to.toISOString(), now);
  return Response.json({ slots });
}
