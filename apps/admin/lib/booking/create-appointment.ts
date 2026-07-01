import type { PrismaClient } from "@portfolio/db";
import type { CalendarProvider, Mailbox } from "@portfolio/core/integrations";
import { BookingInput, generateSessionToken } from "@portfolio/core";
import { listFreeSlots } from "./availability-service";
import { requestReceivedEmail, sendBookingEmail } from "./emails";
import { cancelUrl, formatSlotLabel } from "./format";

/** Chatbot appointments last 30 minutes (see DEFAULT_AVAILABILITY). */
const DURATION_MIN = 30;

/** Thrown when the requested slot is no longer free/valid at booking time. */
export class SlotTakenError extends Error {
  constructor() {
    super("slot_taken");
    this.name = "SlotTakenError";
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

/**
 * Creates a PENDING chatbot appointment for a real free slot, atomically:
 *
 * 1. Validate the payload (Zod).
 * 2. Re-check the slot is still free & valid (defence-in-depth; the partial
 *    unique index on active reservations is the hard double-booking guard).
 * 3. Insert (source CHATBOT) with a random cancel token — a unique-violation
 *    from a concurrent booking maps to {@link SlotTakenError}.
 * 4. Best-effort "request received" email (never blocks the booking).
 */
export async function createAppointment(
  prisma: PrismaClient,
  calendar: CalendarProvider,
  mailbox: Mailbox,
  rawInput: unknown,
  now: Date = new Date(),
): Promise<{ id: string }> {
  const input = BookingInput.parse(rawInput);
  const start = input.requestedAt;
  const windowStart = new Date(start.getTime() - 1);
  const windowEnd = new Date(start.getTime() + DURATION_MIN * 60_000 + 1);

  const free = await listFreeSlots(prisma, calendar, windowStart.toISOString(), windowEnd.toISOString(), now);
  if (!free.includes(start.toISOString())) throw new SlotTakenError();

  const cancelToken = generateSessionToken();
  let created: { id: string };
  try {
    created = await prisma.appointmentRequest.create({
      data: {
        name: `${input.firstName} ${input.lastName}`.trim(),
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        topic: input.reason,
        requestedAt: start,
        durationMin: DURATION_MIN,
        source: "CHATBOT",
        cancelToken,
      },
      select: { id: true },
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlotTakenError();
    throw error;
  }

  await sendBookingEmail(
    mailbox,
    requestReceivedEmail({
      firstName: input.firstName,
      email: input.email,
      whenLabel: formatSlotLabel(start),
      cancelUrl: cancelUrl(cancelToken),
    }),
  );

  return created;
}
