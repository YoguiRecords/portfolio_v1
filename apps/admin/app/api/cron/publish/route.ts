import { prisma } from "@portfolio/db";
import { secretEquals } from "@portfolio/core";
import { publishDue } from "../../../../lib/publishing/publish-due";

/**
 * Scheduled-publish cron endpoint. A external scheduler calls this with the
 * shared secret; it promotes every due SCHEDULED article/event to PUBLISHED.
 *
 * Runs with the back-office `app_admin` role (write). Public pages are rendered
 * dynamically, so no cross-app revalidation is needed — the next request sees
 * the new state immediately.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>`. Generic 401 on any mismatch.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization");
  if (!secret || !provided || !secretEquals(provided, `Bearer ${secret}`)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await publishDue(prisma, new Date());
  return Response.json({ ok: true, ...result });
}
