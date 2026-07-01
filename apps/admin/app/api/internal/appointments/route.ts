import { ZodError } from "zod";
import { prisma } from "@portfolio/db";
import { getCalendar, getMailbox } from "@/lib/integrations/factory";
import { isInternalAuthorized } from "@/lib/internal/guard";
import { createAppointment, SlotTakenError } from "@/lib/booking/create-appointment";

export const dynamic = "force-dynamic";

/**
 * Internal booking endpoint (web → admin, token-guarded). Validates + atomically
 * creates a PENDING chatbot appointment and sends the "request received" email.
 * 201 ok · 400 invalid · 409 slot taken · 401 unauthorized.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isInternalAuthorized(request)) return new Response("Unauthorized", { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    const result = await createAppointment(prisma, getCalendar(), getMailbox(), body);
    return Response.json({ ok: true, id: result.id }, { status: 201 });
  } catch (error) {
    if (error instanceof SlotTakenError) return Response.json({ error: "slot_taken" }, { status: 409 });
    if (error instanceof ZodError) return Response.json({ error: "invalid" }, { status: 400 });
    console.error("[internal/appointments] failed:", error);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
