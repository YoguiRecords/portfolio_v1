import { prisma } from "@portfolio/db";
import { getMailbox } from "@/lib/integrations/factory";
import { isInternalAuthorized } from "@/lib/internal/guard";
import { cancelByToken } from "@/lib/booking/cancel-appointment";

export const dynamic = "force-dynamic";

/**
 * Internal cancellation endpoint (web → admin, token-guarded). Cancels an
 * appointment from its self-service token. Always returns a generic result
 * (no account/appointment enumeration).
 */
export async function POST(request: Request): Promise<Response> {
  if (!isInternalAuthorized(request)) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = (body as { token?: unknown })?.token;
  const result = await cancelByToken(prisma, getMailbox(), token);
  return Response.json(result);
}
